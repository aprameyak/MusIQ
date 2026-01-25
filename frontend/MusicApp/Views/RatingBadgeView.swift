import SwiftUI

struct RatingBadgeView: View {
    let rating: Int
    
    var body: some View {
        Text("\(rating)")
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(.white)
            .frame(width: 32, height: 32)
            .background(badgeColor)
            .clipShape(Circle())
    }
    
    private var badgeColor: Color {
        if rating >= 8 { return Color.green }
        if rating >= 6 { return Color.yellow }
        return Color.red
    }
}
