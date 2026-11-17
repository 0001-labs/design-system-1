import SwiftUI
import XCTest
@testable import DS1

@MainActor final class DS1TagTests: XCTestCase {
    func testDefaultColoursMatchTheWebsSrgbMixes() {
        let colours=DS1TagColours(accent:nil)
        XCTAssertEqual(colours.background.light,0xd9d9d9);XCTAssertEqual(colours.background.dark,0x3a3a3a)
        XCTAssertEqual(colours.ink.light,0x363636);XCTAssertEqual(colours.ink.dark,0xd7d7d7)
    }
    func testLongLabelsKeepTheirIntrinsicWidthUnderANarrowProposal() throws {
        let tag=ImageRenderer(content:DS1Tag("A complete source label remains readable").environment(\.ds1Scale,.desktop))
        tag.proposedSize=ProposedViewSize(width:20,height:20)
        let image=try XCTUnwrap(tag.cgImage)
        XCTAssertGreaterThan(image.width,200);XCTAssertEqual(image.height,20)
        let badge=ImageRenderer(content:DS1Badge("A complete source label remains readable").environment(\.ds1Scale,.desktop))
        badge.proposedSize=ProposedViewSize(width:20,height:20)
        XCTAssertGreaterThan(try XCTUnwrap(badge.cgImage).width,200)
    }
    func testTranslucentAdaptiveAccentsKeepTheirOpacityInBothModes() {
        let colours=DS1TagColours(accent:DS1Color(light:0x336699,dark:0x993366,lightOpacity:0.5,darkOpacity:0.25))
        XCTAssertEqual(colours.background.lightOpacity,0.86,accuracy:0.0001)
        XCTAssertEqual(colours.background.darkOpacity,0.85,accuracy:0.0001)
    }
}
