import "./globals.css";

export const metadata = {
  title: "Exam Portal",
  description: "Secure Online MCQ Examination System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
