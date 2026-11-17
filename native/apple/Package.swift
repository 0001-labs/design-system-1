import PackageDescription

let package = Package(
    name: "DS1",
    platforms: [.iOS(.v18), .macOS(.v14)],
    products: [.library(name: "DS1", targets: ["DS1"])],
    targets: [
        .target(
            name: "DS1",
            resources: [.process("Resources/Icons.xcassets"), .copy("Resources/Fonts")]
        ),
        .testTarget(name: "DS1Tests", dependencies: ["DS1"]),
    ],
    swiftLanguageModes: [.v5]
)
