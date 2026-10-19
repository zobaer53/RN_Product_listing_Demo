// Generates the Product Explorer app icons and splash mark.
//
// Usage: swift scripts/brand/generate-icons.swift [output-dir]   (default: assets/images)
//
// The mark is a shopping bag with a magnifier: "browse products". It is drawn with
// flat shapes only, so it stays legible at launcher sizes and works as a monochrome
// silhouette for Android themed icons.

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// MARK: - Brand palette

func rgb(_ hex: UInt32, _ alpha: CGFloat = 1) -> CGColor {
  CGColor(
    srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
    green: CGFloat((hex >> 8) & 0xFF) / 255,
    blue: CGFloat(hex & 0xFF) / 255,
    alpha: alpha)
}

let brandTeal = rgb(0x4AB7B6)
let brandTealDark = rgb(0x2F8F8E)
let brandOrange = rgb(0xFDAA5D)
let lensTint = rgb(0xFFF4E8)
let white = rgb(0xFFFFFF)

// MARK: - Mark geometry (100 x 100 design box, y grows downwards)

/// Bounding box of the artwork inside the design box, used to centre it.
let markBounds = CGRect(x: 12, y: 16, width: 86, height: 82)

enum Style { case color, monochrome }

/// Draws the mark on its own transparent layer (so cut-outs stay transparent),
/// then composites it so that `markBounds` fits centred inside `target`.
func drawMark(in dest: CGContext, target: CGRect, style: Style) {
  let ctx = makeContext(size: dest.width, opaque: false)
  let scale = min(target.width / markBounds.width, target.height / markBounds.height)
  ctx.saveGState()
  // Flip to a top-left origin, then map the design box onto the target.
  ctx.translateBy(x: 0, y: CGFloat(ctx.height))
  ctx.scaleBy(x: 1, y: -1)
  ctx.translateBy(
    x: target.midX - markBounds.midX * scale,
    y: (CGFloat(ctx.height) - target.midY) - markBounds.midY * scale)
  ctx.scaleBy(x: scale, y: scale)

  let ink = style == .color ? brandTeal : white
  ctx.setLineCap(.round)

  // Bag handle.
  ctx.setStrokeColor(ink)
  ctx.setLineWidth(6)
  ctx.addArc(
    center: CGPoint(x: 40, y: 34), radius: 13, startAngle: .pi, endAngle: 0, clockwise: false)
  ctx.strokePath()

  // Bag body.
  let body = CGPath(
    roundedRect: CGRect(x: 12, y: 30, width: 58, height: 56), cornerWidth: 10, cornerHeight: 10,
    transform: nil)
  ctx.addPath(body)
  ctx.setFillColor(ink)
  ctx.fillPath()

  // Rim band (colour only; the silhouette stays solid).
  if style == .color {
    ctx.saveGState()
    ctx.addPath(body)
    ctx.clip()
    ctx.setFillColor(brandTealDark)
    ctx.fill(CGRect(x: 12, y: 30, width: 58, height: 9))
    ctx.restoreGState()
  }
  // Cut-outs (handle sockets and a gap ring around the magnifier) are punched
  // through, so the mark sits cleanly on any background.
  ctx.setBlendMode(.clear)
  for x in [27.0, 53.0] {
    ctx.fillEllipse(in: CGRect(x: x - 2.6, y: 44 - 2.6, width: 5.2, height: 5.2))
  }
  let lens = CGPoint(x: 70, y: 68)
  ctx.fillEllipse(in: CGRect(x: lens.x - 25, y: lens.y - 25, width: 50, height: 50))
  ctx.setLineWidth(16)
  ctx.move(to: CGPoint(x: lens.x + 14, y: lens.y + 14))
  ctx.addLine(to: CGPoint(x: 91, y: 89))
  ctx.strokePath()
  ctx.setBlendMode(.normal)

  let accent = style == .color ? brandOrange : white
  if style == .color {
    ctx.setFillColor(lensTint)
    ctx.fillEllipse(in: CGRect(x: lens.x - 16, y: lens.y - 16, width: 32, height: 32))
  }
  ctx.setStrokeColor(accent)
  ctx.setLineWidth(7)
  ctx.strokeEllipse(in: CGRect(x: lens.x - 16, y: lens.y - 16, width: 32, height: 32))
  ctx.setLineWidth(9)
  ctx.move(to: CGPoint(x: lens.x + 14.5, y: lens.y + 14.5))
  ctx.addLine(to: CGPoint(x: 91, y: 89))
  ctx.strokePath()

  // Glint inside the lens.
  ctx.setStrokeColor(style == .color ? brandOrange : white)
  ctx.setLineWidth(3)
  ctx.addArc(
    center: lens, radius: 9, startAngle: .pi * 1.1, endAngle: .pi * 1.45, clockwise: false)
  ctx.strokePath()

  ctx.restoreGState()
  dest.draw(ctx.makeImage()!, in: CGRect(x: 0, y: 0, width: dest.width, height: dest.height))
}

// MARK: - Rendering helpers

func makeContext(size: Int, opaque: Bool) -> CGContext {
  let info = opaque ? CGImageAlphaInfo.noneSkipLast : CGImageAlphaInfo.premultipliedLast
  guard
    let ctx = CGContext(
      data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
      space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: info.rawValue)
  else { fatalError("Cannot create a \(size)px bitmap context") }
  ctx.setShouldAntialias(true)
  ctx.interpolationQuality = .high
  return ctx
}

func writePNG(_ ctx: CGContext, to url: URL) {
  guard let image = ctx.makeImage(),
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)
  else { fatalError("Cannot encode \(url.path)") }
  CGImageDestinationAddImage(dest, image, nil)
  guard CGImageDestinationFinalize(dest) else { fatalError("Cannot write \(url.path)") }
  print("wrote \(url.path)")
}

/// A centred square occupying `fraction` of a canvas of `size` pixels.
func centred(_ size: Int, _ fraction: CGFloat) -> CGRect {
  let side = CGFloat(size) * fraction
  let origin = (CGFloat(size) - side) / 2
  return CGRect(x: origin, y: origin, width: side, height: side)
}

// MARK: - Outputs

let outDir = URL(
  fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "assets/images",
  isDirectory: true)
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

// iOS / default app icon: opaque, white background (the OS applies the corner mask).
do {
  let ctx = makeContext(size: 1024, opaque: true)
  ctx.setFillColor(white)
  ctx.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
  drawMark(in: ctx, target: centred(1024, 0.72), style: .color)
  writePNG(ctx, to: outDir.appendingPathComponent("icon.png"))
}

// Android adaptive icon layers (108dp canvas; keep artwork inside the 66% safe zone).
do {
  let ctx = makeContext(size: 1024, opaque: false)
  drawMark(in: ctx, target: centred(1024, 0.5), style: .color)
  writePNG(ctx, to: outDir.appendingPathComponent("android-icon-foreground.png"))
}
do {
  let ctx = makeContext(size: 1024, opaque: true)
  ctx.setFillColor(white)
  ctx.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
  writePNG(ctx, to: outDir.appendingPathComponent("android-icon-background.png"))
}
do {
  let ctx = makeContext(size: 1024, opaque: false)
  drawMark(in: ctx, target: centred(1024, 0.5), style: .monochrome)
  writePNG(ctx, to: outDir.appendingPathComponent("android-icon-monochrome.png"))
}

// Splash mark: transparent, shown on the white splash background.
do {
  let ctx = makeContext(size: 512, opaque: false)
  drawMark(in: ctx, target: centred(512, 0.92), style: .color)
  writePNG(ctx, to: outDir.appendingPathComponent("splash-icon.png"))
}
