export const metadata = {
  title: "موقعیت یاب",
  dir: "rtl",
  lang: "fa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="fa">
      <body>{children}</body>
    </html>
  );
}

