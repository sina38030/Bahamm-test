/**
 * Because Leaflet touches `window`, we defer rendering to the client
 * with `dynamic` and `ssr: false`.
 */
import dynamic from "next/dynamic";

const MapScreen = dynamic(() => import("@/components/MapScreen"), {
  ssr: false,
});

export default function Home() {
  return <MapScreen />;
}

