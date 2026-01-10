import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          <h1 className="text-4xl font-bold text-textPrimary mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-textSecondary">
            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Information We Collect</h2>
              <p className="leading-relaxed mb-3">
                MusIQ collects information necessary to provide our service, including:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Account information (email, username)</li>
                <li>Music ratings and preferences</li>
                <li>Social interactions and friend connections</li>
                <li>Usage data to improve the app experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use your information to provide personalized music recommendations, calculate global rankings, 
                enable social features, and improve our services. Your ratings are used to generate aggregated 
                statistics and rankings visible to all users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your data, including encryption, 
                secure authentication, and regular security audits. Your account information is stored securely 
                and never shared with third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Third-Party Services</h2>
              <p className="leading-relaxed">
                MusIQ may integrate with third-party services for authentication (Apple, Google, Spotify) and 
                music metadata. These services have their own privacy policies governing data collection and use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Your Rights</h2>
              <p className="leading-relaxed">
                You have the right to access, modify, or delete your account and data at any time through 
                the app settings. You can also request a copy of your data or opt out of certain data collection 
                features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this privacy policy or our data practices, please contact us 
                through the app or reach out to our privacy team.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-textSecondary">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

