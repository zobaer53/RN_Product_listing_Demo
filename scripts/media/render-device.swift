// Renders a device frame PNG that is laid over a screen recording.
//
// Usage:
//   swift render-device.swift --platform ios|android --canvas 696x1388 \
//     --screen X,Y,W,H --radius R --bezel B --out frame.png [--background #RRGGBB]
//
// The PNG is opaque everywhere except a rounded "screen hole" at X,Y,W,H (top-left origin),
// so overlaying it on the padded recording gives rounded screen corners for free.
// Platform details make the two devices easy to tell apart:
//   iOS      thin titanium rim, Dynamic Island, action + volume buttons left, side + camera control right
//   Android  matte rim, centred punch-hole camera, power + volume rocker on the right

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

func arg(_ name: String, _ fallback: String? = nil) -> String {
  let args = CommandLine.arguments
  if let i = args.firstIndex(of: "--\(name)"), i + 1 < args.count { return args[i + 1] }
  guard let fallback else {
    FileHandle.standardError.write("missing --\(name)\n".data(using: .utf8)!)
    exit(2)
  }
  return fallback
}

func numbers(_ value: String, _ separator: Character) -> [CGFloat] {
  value.split(separator: separator).map { CGFloat(Double($0)!) }
}

func color(_ hex: String, _ alpha: CGFloat = 1) -> CGColor {
  let value = UInt32(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0
  return CGColor(
    srgbRed: CGFloat((value >> 16) & 0xFF) / 255, green: CGFloat((value >> 8) & 0xFF) / 255,
    blue: CGFloat(value & 0xFF) / 255, alpha: alpha)
}

let isIOS = arg("platform").lowercased() == "ios"
let canvas = numbers(arg("canvas"), "x")
let s = numbers(arg("screen"), ",")
let radius = CGFloat(Double(arg("radius"))!)
let bezel = CGFloat(Double(arg("bezel"))!)
let background = color(arg("background", "#EEF1F5"))
let out = URL(fileURLWithPath: arg("out"))

let width = Int(canvas[0])
let height = Int(canvas[1])
guard
  let ctx = CGContext(
    data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
else { fatalError("cannot create bitmap context") }

// Work in a top-left origin, like ffmpeg.
ctx.translateBy(x: 0, y: CGFloat(height))
ctx.scaleBy(x: 1, y: -1)

let screen = CGRect(x: s[0], y: s[1], width: s[2], height: s[3])
let body = screen.insetBy(dx: -bezel, dy: -bezel)
let bodyRadius = radius + bezel
let rim = isIOS ? color("8E9196") : color("3C3F44")
let bezelColor = color("0A0A0B")

func roundedRect(_ rect: CGRect, _ r: CGFloat) -> CGPath {
  CGPath(roundedRect: rect, cornerWidth: r, cornerHeight: r, transform: nil)
}

// Background.
ctx.setFillColor(background)
ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))

// Hardware buttons: (left side?, top as a fraction of body height, length fraction).
let buttons: [(left: Bool, top: CGFloat, length: CGFloat)] =
  isIOS
  ? [(true, 0.165, 0.035), (true, 0.225, 0.062), (true, 0.300, 0.062),
    (false, 0.240, 0.095), (false, 0.520, 0.055)]
  : [(false, 0.200, 0.060), (false, 0.300, 0.120)]
let buttonDepth = max(3, bezel * 0.22)
ctx.setFillColor(rim)
for b in buttons {
  let x = b.left ? body.minX - buttonDepth : body.maxX - buttonDepth
  let rect = CGRect(
    x: x, y: body.minY + body.height * b.top, width: buttonDepth * 2, height: body.height * b.length)
  ctx.addPath(roundedRect(rect, buttonDepth))
  ctx.fillPath()
}

// Body with a soft drop shadow, then the metal rim and the black bezel.
ctx.saveGState()
// Shadow offsets live in base space (y up), so a negative height drops it below.
ctx.setShadow(offset: CGSize(width: 0, height: -18), blur: 40, color: color("1B2430", 0.28))
ctx.setFillColor(rim)
ctx.addPath(roundedRect(body, bodyRadius))
ctx.fillPath()
ctx.restoreGState()

let rimWidth = max(2, bezel * (isIOS ? 0.22 : 0.14))
ctx.setFillColor(bezelColor)
ctx.addPath(roundedRect(body.insetBy(dx: rimWidth, dy: rimWidth), bodyRadius - rimWidth))
ctx.fillPath()

// Screen hole: fully transparent so the recording shows through.
ctx.setBlendMode(.clear)
ctx.addPath(roundedRect(screen, radius))
ctx.fillPath()
ctx.setBlendMode(.normal)

// Front camera.
let sw = screen.width
// Sized to cover the island the simulator already draws (measured on iPhone 17 Pro recordings).
if isIOS {
  let island = CGRect(
    x: screen.midX - sw * 0.157, y: screen.minY + sw * 0.034, width: sw * 0.314, height: sw * 0.094)
  ctx.setFillColor(color("000000"))
  ctx.addPath(roundedRect(island, island.height / 2))
  ctx.fillPath()
  let lens = sw * 0.03
  ctx.setFillColor(color("1C2233"))
  ctx.fillEllipse(
    in: CGRect(x: island.maxX - island.height / 2 - lens / 2, y: island.midY - lens / 2, width: lens, height: lens))
} else {
  let d = sw * 0.042
  let hole = CGRect(x: screen.midX - d / 2, y: screen.minY + sw * 0.03, width: d, height: d)
  ctx.setFillColor(color("000000"))
  ctx.fillEllipse(in: hole)
  ctx.setFillColor(color("1C2233"))
  ctx.fillEllipse(in: hole.insetBy(dx: d * 0.28, dy: d * 0.28))
}

guard let image = ctx.makeImage(),
  let dest = CGImageDestinationCreateWithURL(out as CFURL, UTType.png.identifier as CFString, 1, nil)
else { fatalError("cannot encode PNG") }
CGImageDestinationAddImage(dest, image, nil)
guard CGImageDestinationFinalize(dest) else { fatalError("cannot write \(out.path)") }
