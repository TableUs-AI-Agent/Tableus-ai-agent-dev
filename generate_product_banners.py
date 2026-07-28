import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def create_mac_mockup(img_path, url_text, output_path, badge_text=None):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return

    src_img = Image.open(img_path).convert("RGBA")
    
    # Scale down src image slightly if huge
    max_w = 1400
    if src_img.width > max_w:
        ratio = max_w / src_img.width
        src_img = src_img.resize((max_w, int(src_img.height * ratio)), Image.Resampling.LANCZOS)

    w, h = src_img.size
    
    title_bar_height = 42
    padding = 40
    shadow_blur = 30
    
    canvas_w = w + (padding * 2) + (shadow_blur * 2)
    canvas_h = h + title_bar_height + (padding * 2) + (shadow_blur * 2)
    
    # Canvas background - elegant dark slate gradient
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (9, 13, 22, 255))
    
    # Create radial background glow
    glow = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    center_x, center_y = canvas_w // 2, canvas_h // 2
    max_r = math.sqrt(center_x**2 + center_y**2)
    
    # Subtle indigo/violet ambient accent in center
    for r in range(int(max_r), 0, -10):
        alpha = int(45 * (1 - r / max_r))
        glow_draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(99, 102, 241, alpha))
    
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    canvas = Image.alpha_composite(canvas, glow)
    
    # Window surface
    win_w = w
    win_h = h + title_bar_height
    win_x = padding + shadow_blur
    win_y = padding + shadow_blur
    
    # Window drop shadow mask
    shadow = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        [win_x, win_y + 8, win_x + win_w, win_y + win_h + 8],
        radius=14,
        fill=(0, 0, 0, 160)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas = Image.alpha_composite(canvas, shadow)
    
    # Window base image
    window = Image.new("RGBA", (win_w, win_h), (0, 0, 0, 0))
    
    # Title Bar
    title_bar = Image.new("RGBA", (win_w, title_bar_height), (24, 24, 27, 255))
    tb_draw = ImageDraw.Draw(title_bar)
    
    # macOS buttons (Red, Yellow, Green)
    tb_draw.ellipse([16, 15, 28, 27], fill=(255, 95, 86, 255))   # Close
    tb_draw.ellipse([36, 15, 48, 27], fill=(255, 189, 46, 255))  # Minimize
    tb_draw.ellipse([56, 15, 68, 27], fill=(39, 201, 63, 255))   # Maximize
    
    # URL pill box
    pill_w = min(400, win_w - 200)
    pill_x = (win_w - pill_w) // 2
    pill_y = 9
    pill_h = 24
    tb_draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=6, fill=(39, 39, 42, 255), outline=(63, 63, 70, 255), width=1)
    
    # URL text
    tb_draw.text((pill_x + 12, pill_y + 4), url_text, fill=(161, 161, 170, 255))
    
    # Combine title bar and screenshot
    window.paste(title_bar, (0, 0))
    window.paste(src_img, (0, title_bar_height))
    
    # Apply rounded corners mask to the entire window mockup
    mask = Image.new("L", (win_w, win_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, win_w, win_h], radius=12, fill=255)
    
    # Subtle window border
    border = Image.new("RGBA", (win_w, win_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border)
    b_draw.rounded_rectangle([0, 0, win_w - 1, win_h - 1], radius=12, outline=(63, 63, 70, 180), width=1)
    
    window_masked = Image.new("RGBA", (win_w, win_h), (0, 0, 0, 0))
    window_masked.paste(window, (0, 0), mask)
    window_masked = Image.alpha_composite(window_masked, border)
    
    canvas.paste(window_masked, (win_x, win_y), window_masked)
    
    # Save output banner
    out_dir = os.path.dirname(output_path)
    if not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
        
    canvas.convert("RGB").save(output_path, quality=95)
    print(f"Generated product mockup: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ss_dir = os.path.join(base_dir, "docs", "screenshots")
    out_dir = os.path.join(base_dir, "docs", "images")
    
    mockups = [
        ("01_discover_hero.png", "https://tableus.app/discover", os.path.join(out_dir, "banner_discover_hero.png")),
        ("02_discover_results.png", "https://tableus.app/discover?q=group_ramen", os.path.join(out_dir, "banner_group_search.png")),
        ("04_friends_hub.png", "https://tableus.app/friends", os.path.join(out_dir, "banner_friends.png")),
        ("05_review_page.png", "https://tableus.app/review", os.path.join(out_dir, "banner_review.png")),
        ("06_profile_page.png", "https://tableus.app/profile", os.path.join(out_dir, "banner_profile.png")),
    ]
    
    for src_file, url, out_path in mockups:
        src_path = os.path.join(ss_dir, src_file)
        create_mac_mockup(src_path, url, out_path)
