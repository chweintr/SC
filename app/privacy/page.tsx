export const metadata = { 
  title: "Privacy — SquatchChat", 
  description: "Privacy policy for SquatchChat." 
};

export default function Page() {
  return (
    <main className="mx-auto max-w-screen-sm p-6 prose">
      <h1>Privacy Policy</h1>
      <ul>
        <li><b>Data we collect:</b> Sign in with Apple identifier and (if provided) email; basic diagnostics.</li>
        <li><b>Voice:</b> Audio is sent to our service to generate replies, then discarded. We don't build profiles.</li>
        <li><b>Tracking/ads:</b> No cross-app tracking. No third-party ads.</li>
        <li><b>Contact:</b> <a href="mailto:calebweintraub@gmail.com">calebweintraub@gmail.com</a></li>
      </ul>
      <p>© 2025 Caleb Weintraub</p>
    </main>
  );
}
