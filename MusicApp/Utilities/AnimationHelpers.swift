import SwiftUI

extension View {
    func fadeIn(delay: Double = 0) -> some View {
        self.modifier(FadeInModifier(delay: delay))
    }
    
    func slideIn(from edge: Edge, delay: Double = 0) -> some View {
        self.modifier(SlideInModifier(edge: edge, delay: delay))
    }
    
    func scaleIn(delay: Double = 0) -> some View {
        self.modifier(ScaleInModifier(delay: delay))
    }
}

struct FadeInModifier: ViewModifier {
    let delay: Double
    @State private var opacity: Double = 0
    
    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.5).delay(delay)) {
                    opacity = 1
                }
            }
    }
}

struct SlideInModifier: ViewModifier {
    let edge: Edge
    let delay: Double
    @State private var offset: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .offset(x: edge == .leading ? -offset : edge == .trailing ? offset : 0,
                   y: edge == .top ? -offset : edge == .bottom ? offset : 0)
            .onAppear {
                offset = 100
                withAnimation(.spring(response: 0.6, dampingFraction: 0.8).delay(delay)) {
                    offset = 0
                }
            }
    }
}

struct ScaleInModifier: ViewModifier {
    let delay: Double
    @State private var scale: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7).delay(delay)) {
                    scale = 1
                }
            }
    }
}
