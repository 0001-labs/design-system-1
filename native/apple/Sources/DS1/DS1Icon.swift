import SwiftUI

public struct DS1Icon: View {
    public enum Size: Sendable {
        case small, regular, large
        var points: CGFloat {
            switch self {
            case .small: 12
            case .regular: 14
            case .large: DS1Metrics.control
            }
        }
    }

    @Environment(\.ds1Scale) private var scale
    let name: DS1IconName
    let size: Size

    public init(_ name: DS1IconName, size: Size = .regular) {
        self.name = name
        self.size = size
    }

    public var body: some View {
        DS1Icon.image(name)
            .resizable()
            .renderingMode(.template)
            .interpolation(.high)
            .frame(width: scale(size.points), height: scale(size.points))
            .accessibilityHidden(true)
    }

    public static func image(_ name: DS1IconName) -> Image {
        Image(name.rawValue, bundle: .module)
    }
}
