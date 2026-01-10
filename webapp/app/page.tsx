import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-textPrimary mb-4">MusIQ</h1>
          <p className="text-xl text-textSecondary">Rate. Discover. Influence.</p>
        </div>

        <div className="bg-card rounded-lg p-8 mb-8 shadow-sm border border-border">
          <h2 className="text-2xl font-semibold text-textPrimary mb-4">About MusIQ</h2>
          <p className="text-textSecondary leading-relaxed mb-4">
            MusIQ is a music rating platform where you can share your honest opinions on albums, songs, and artists.
            Your ratings shape global music rankings and help others discover new sounds.
          </p>
          <p className="text-textSecondary leading-relaxed">
            Build your taste profile, compare with friends, and influence the charts with every rating.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/support" 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
          >
            Support
          </Link>
          <Link 
            href="/privacy" 
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90 transition"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  )
}

