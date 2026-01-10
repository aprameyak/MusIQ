import Link from 'next/link'

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          <h1 className="text-4xl font-bold text-textPrimary mb-8">Support</h1>

          <div className="space-y-6 text-textSecondary">
            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Getting Started</h2>
              <p className="leading-relaxed">
                Download MusIQ from the App Store and create an account to start rating music. 
                You can sign up with email or use Apple, Google, or Spotify to get started quickly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Rating Music</h2>
              <p className="leading-relaxed">
                Rate albums, songs, and artists on a scale of 1-10. Add tags to describe your experience 
                and help others understand your perspective. Your ratings contribute to global rankings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Rate music and build your taste profile</li>
                <li>Explore global rankings and trending music</li>
                <li>Connect with friends and compare compatibility</li>
                <li>Discover new music based on your preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-textPrimary mb-3">Need Help?</h2>
              <p className="leading-relaxed">
                If you encounter any issues or have questions, please contact us through the app settings 
                or reach out to our support team. We're here to help you get the most out of MusIQ.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

