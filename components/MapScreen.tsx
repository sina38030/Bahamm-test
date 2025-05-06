"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "bootstrap";          // JS for the modal

export default function MapScreen() {
  const mapRef = useRef<HTMLDivElement>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState("موقعیت را روی نقشه مشخص کنید");

  // Bootstrap modal instance (held outside React state)
  const modalRef = useRef<bootstrap.Modal | null>(null);

  /* ---------- map initialisation ---------- */
  useEffect(() => {
    if (!mapRef.current) return;

    // create map only once
    const map = L.map(mapRef.current).setView([36.2605, 59.6168], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: "pin-icon",
      html: `<div class="pin"></div><div class="pin-shadow"></div>`,
      iconSize: [28, 64],
      iconAnchor: [14, 64],
      popupAnchor: [-5, -90],
    });

    pinMarkerRef.current = L.marker([36.2605, 59.6168], {
      icon: pinIcon,
      draggable: true,
      autoPan: true,
    })
      .addTo(map)
      .bindPopup(
        `<div class="fw-semibold">سفارش شما به این آدرس ارسال خواهد شد</div><div class="text-muted">پین رو به موقعیت دقیقت حرکت بده</div>`
      )
      .openPopup();

    // update address when the marker stops moving
    pinMarkerRef.current.on("moveend", async (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      reverseGeocode(lat, lng);
    });

    reverseGeocode(36.2605, 59.6168); // first lookup

    return () => map.remove();
  }, []);

  /* ---------- helpers ---------- */
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=fa`;
      const res = await fetch(url);
      const data = await res.json();

      const a = data.address || {};
      const parts: string[] = [];
      if (a.road) parts.push(a.road);
      if (a.neighbourhood) parts.push(a.neighbourhood);
      if (a.suburb) parts.push(a.suburb);
      if (a.village) parts.push(a.village);
      if (a.city) parts.push(a.city);
      if (a.state) parts.push(a.state);

      setAddress(parts.join(" - ") || "آدرس نامشخص");
    } catch (err) {
      setAddress("خطا در واکشی آدرس");
    }
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([latitude, longitude]).openPopup();
        reverseGeocode(latitude, longitude);
      }
    });
  }

  /* ---------- bootstrap modal controls ---------- */
  function openModal() {
    modalRef.current ??=
      new bootstrap.Modal(document.getElementById("addressModal")!);
    modalRef.current.show();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: send values to your server
    modalRef.current?.hide();
  }

  /* ---------- render ---------- */
  return (
    <div id="map-container">
      <div id="map" ref={mapRef} />

      {/* locate‑me button */}
      <div id="locate-me-container">
        <button
          id="locate-me-btn"
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={locateMe}
        >
          <i className="bi bi-geo-alt"></i>
          <span>برو به موقعیت من</span>
        </button>
      </div>

      {/* bottom card */}
      <div id="address-card" className="card">
        <div className="card-body d-flex align-items-start gap-2">
          <div className="flex-grow-1">
            <p id="current-address" className="mb-3">
              {address}
            </p>
            <button
              id="confirm-position"
              className="btn btn-success w-100"
              onClick={openModal}
            >
              تایید آدرس
            </button>
          </div>
        </div>
      </div>

      {/* Bootstrap modal */}
      <div
        className="modal fade"
        id="addressModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form
            id="addressForm"
            className="modal-content needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="modal-header">
              <h5 className="modal-title">تکمیل اطلاعات آدرس</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="fullAddress" className="form-label">
                  آدرس
                </label>
                <textarea
                  id="fullAddress"
                  className="form-control"
                  rows={3}
                  required
                />
                <div className="invalid-feedback">لطفاً آدرس را وارد کنید.</div>
              </div>

              <div className="mb-3">
                <label htmlFor="details" className="form-label">
                  جزییات
                </label>
                <input
                  id="details"
                  className="form-control"
                  placeholder="مثلاً پلاک ۱۲، واحد ۳"
                  required
                />
                <div className="invalid-feedback">
                  لطفاً جزییات را وارد کنید.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-success w-100">
                ثبت آدرس
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

