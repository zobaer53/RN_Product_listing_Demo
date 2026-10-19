// Renders the caption bar shown above each framed showcase video.
//
// Usage:
//   swift render-caption.swift --platform android|ios --text "Google Pixel 6a" \
//     --width 696 --height 120 --out caption.png [--background transparent|#RRGGBB] [--theme light|dark]
//
// Draws a coloured platform badge ("Android" / "iOS") followed by the device name,
// centred horizontally. With the light theme (default) the text is dark.

import AppKit
import Foundation

func arg(_ name: String, _ fallback: String? = nil) -> String {
  let args = CommandLine.arguments
  if let i = args.firstIndex(of: "--\(name)"), i + 1 < args.count { return args[i + 1] }
  guard let fallback else {
    FileHandle.standardError.write("missing --\(name)\n".data(using: .utf8)!)
    exit(2)
  }
  return fallback
}

func color(_ hex: String) -> NSColor {
  let value = UInt32(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0
  return NSColor(
    srgbRed: CGFloat((value >> 16) & 0xFF) / 255, green: CGFloat((value >> 8) & 0xFF) / 255,
    blue: CGFloat(value & 0xFF) / 255, alpha: 1)
}

let platform = arg("platform").lowercased()
let text = arg("text")
let width = Int(arg("width"))!
let height = Int(arg("height"))!
let out = arg("out")
let background = arg("background", "transparent")
let dark = arg("theme", "light") == "dark"

// Platform badge colours: Android green, Apple near-black (inverted on dark backgrounds).
let badge: (label: String, fill: NSColor, ink: NSColor) =
  platform == "android"
  ? ("Android", color("3DDC84"), color("073B22"))
  : ("iOS", dark ? .white : color("1D1D1F"), dark ? color("1D1D1F") : .white)
let textColor = dark ? NSColor.white : color("303733")

guard
  let ctx = CGContext(
    data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
else { fatalError("cannot create bitmap context") }
NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: false)

if background != "transparent" {
  color(background).setFill()
  NSRect(x: 0, y: 0, width: width, height: height).fill()
}

// Fit the text: start from a size relative to the bar height and shrink if too wide.
var fontSize = CGFloat(height) * 0.30
var badgeText: NSAttributedString
var bodyText: NSAttributedString
var badgeSize: NSSize
var total: CGFloat
repeat {
  badgeText = NSAttributedString(
    string: badge.label,
    attributes: [.font: NSFont.systemFont(ofSize: fontSize * 0.85, weight: .bold), .foregroundColor: badge.ink])
  bodyText = NSAttributedString(
    string: text,
    attributes: [.font: NSFont.systemFont(ofSize: fontSize, weight: .semibold), .foregroundColor: textColor])
  badgeSize = NSSize(
    width: badgeText.size().width + fontSize * 1.1, height: badgeText.size().height + fontSize * 0.5)
  total = badgeSize.width + fontSize * 0.6 + bodyText.size().width
  if total <= CGFloat(width) * 0.92 { break }
  fontSize -= 1
} while fontSize > 8

let midY = CGFloat(height) / 2
var x = (CGFloat(width) - total) / 2
let badgeRect = NSRect(x: x, y: midY - badgeSize.height / 2, width: badgeSize.width, height: badgeSize.height)
badge.fill.setFill()
NSBezierPath(roundedRect: badgeRect, xRadius: badgeSize.height / 2, yRadius: badgeSize.height / 2).fill()
badgeText.draw(
  at: NSPoint(
    x: badgeRect.midX - badgeText.size().width / 2, y: midY - badgeText.size().height / 2))
x = badgeRect.maxX + fontSize * 0.6
bodyText.draw(at: NSPoint(x: x, y: midY - bodyText.size().height / 2))

NSGraphicsContext.current = nil
guard let image = ctx.makeImage(),
  let png = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:])
else { fatalError("cannot encode PNG") }
try png.write(to: URL(fileURLWithPath: out))
