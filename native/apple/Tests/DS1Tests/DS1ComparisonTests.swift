import SwiftUI
import XCTest
@testable import DS1

@MainActor final class DS1ComparisonTests: XCTestCase {
    func testUnknownZeroFixedDomainAndClamping() {
        let value = DS1ComparisonValues(current: nil, previous: 0)
        XCTAssertNil(value.currentFraction)
        XCTAssertEqual(value.previousFraction, 0)
        XCTAssertEqual(value.maximum, 1)
        let fixed = DS1ComparisonValues(current: 0.2, previous: 1.5, maximum: 1)
        XCTAssertEqual(fixed.currentFraction!, 0.2, accuracy: 0.0001)
        XCTAssertEqual(fixed.previousFraction, 1)
        XCTAssertEqual(DS1ComparisonValues(current: -1, previous: 20).currentFraction, 0)
        XCTAssertNil(DS1ComparisonValues(current: .infinity, previous: .nan).currentFraction)
        XCTAssertEqual(DS1ComparisonValues(current: 10, previous: 20, maximum: 0).maximum, 20)
    }
    func testComparisonOccupiesOneSquareAndNothingWhenBothPeriodsAreUnknown() {
        let view = DS1ComparisonBars(current: 1, previous: 2, label: "Measured periods").environment(\.ds1Scale, .desktop).frame(width: 160)
        XCTAssertEqual(NSHostingView(rootView: view).fittingSize.height, 20, accuracy: 0.01)
        let missing = DS1ComparisonBars(current: nil, previous: nil, label: "Unknown periods").frame(width: 160)
        XCTAssertEqual(NSHostingView(rootView: missing).fittingSize.height, 0, accuracy: 0.01)
    }
    func testRenderedTracksKeepUnknownSeparateFromZeroAndRespectTheFixedScale() throws {
        for scheme in [ColorScheme.light, .dark] {
            func render<V: View>(_ view: V) throws -> CGImage {
                let renderer = ImageRenderer(content: view.frame(width: 160, height: 20).background(DS1Color.paper).environment(\.ds1Scale, .desktop).environment(\.colorScheme, scheme))
                renderer.scale = 1
                return try XCTUnwrap(renderer.cgImage)
            }
            func pixel(_ image: CGImage, _ x: Int, _ y: Int) throws -> [UInt8] {
                let data = try XCTUnwrap(image.dataProvider?.data), bytes = try XCTUnwrap(CFDataGetBytePtr(data))
                let start = y * image.bytesPerRow + x * image.bitsPerPixel / 8
                return Array(UnsafeBufferPointer(start: bytes + start, count: image.bitsPerPixel / 8))
            }
            let blue = try pixel(render(Rectangle().fill(DS1Color.sharpBlue)), 1, 1)
            let grey = try pixel(render(Rectangle().fill(DS1Color.textMuted)), 1, 1)
            let track = try pixel(render(Rectangle().fill(DS1Color.fill)), 1, 1)
            let paper = try pixel(render(Rectangle().fill(DS1Color.paper)), 1, 1)
            let measured = try render(DS1ComparisonBars(current: 0.25, previous: 0.5, maximum: 1, label: "Measured"))
            XCTAssertEqual(try pixel(measured, 20, 4), blue)
            XCTAssertEqual(try pixel(measured, 50, 4), track)
            XCTAssertEqual(try pixel(measured, 50, 14), grey)
            XCTAssertEqual(try pixel(measured, 90, 14), track)
            let missing = try render(DS1ComparisonBars(current: nil, previous: 0, label: "Unknown and zero"))
            XCTAssertEqual(try pixel(missing, 80, 4), paper)
            XCTAssertEqual(try pixel(missing, 80, 14), track)
        }
    }

}
