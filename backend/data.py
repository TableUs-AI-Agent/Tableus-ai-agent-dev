"""
In-memory data layer: mock restaurants, demo users with friend graphs,
pre-seeded reviews, and taste profiles.
"""
from typing import Optional
import uuid

RESTAURANTS = [
    {
        "id": "r1",
        "name": "Sakura Sushi Bar",
        "cuisine": "Japanese",
        "rating": 4.7,
        "user_ratings_total": 342,
        "price_level": 3,
        "atmosphere": "intimate, upscale",
        "address": "123 Newbury St, Boston, MA",
        "description": "Omakase-focused sushi bar with fresh daily imports from Tsukiji market.",
        "latitude": 42.3501,
        "longitude": -71.0789,
    },
    {
        "id": "r2",
        "name": "Trattoria Milano",
        "cuisine": "Italian",
        "rating": 4.6,
        "user_ratings_total": 518,
        "price_level": 3,
        "atmosphere": "romantic, cozy",
        "address": "45 Hanover St, Boston, MA",
        "description": "Handmade pasta and wood-fired pizzas in a candlelit North End setting.",
        "latitude": 42.3631,
        "longitude": -71.0546,
    },
    {
        "id": "r3",
        "name": "Bangkok Street Kitchen",
        "cuisine": "Thai",
        "rating": 4.5,
        "user_ratings_total": 287,
        "price_level": 2,
        "atmosphere": "casual, vibrant",
        "address": "78 Mass Ave, Cambridge, MA",
        "description": "Authentic street-food-style Thai with bold curries and fresh herbs.",
        "latitude": 42.3621,
        "longitude": -71.0944,
    },
    {
        "id": "r4",
        "name": "El Camino Taqueria",
        "cuisine": "Mexican",
        "rating": 4.4,
        "user_ratings_total": 412,
        "price_level": 1,
        "atmosphere": "lively, casual",
        "address": "200 Somerville Ave, Somerville, MA",
        "description": "Handmade tortillas, slow-smoked meats, and fresh salsas.",
        "latitude": 42.3801,
        "longitude": -71.0989,
    },
    {
        "id": "r5",
        "name": "The Pier Seafood Grill",
        "cuisine": "Seafood",
        "rating": 4.8,
        "user_ratings_total": 623,
        "price_level": 4,
        "atmosphere": "upscale, waterfront",
        "address": "1 Long Wharf, Boston, MA",
        "description": "New England seafood with harbor views and an extensive raw bar.",
        "latitude": 42.3601,
        "longitude": -71.0489,
    },
    {
        "id": "r6",
        "name": "Spice Route",
        "cuisine": "Indian",
        "rating": 4.5,
        "user_ratings_total": 198,
        "price_level": 2,
        "atmosphere": "warm, aromatic",
        "address": "321 Harvard St, Brookline, MA",
        "description": "Regional Indian specialties from Kerala to Punjab with house-ground spice blends.",
        "latitude": 42.3421,
        "longitude": -71.1289,
    },
    {
        "id": "r7",
        "name": "Le Petit Bistro",
        "cuisine": "French",
        "rating": 4.6,
        "user_ratings_total": 156,
        "price_level": 4,
        "atmosphere": "romantic, elegant",
        "address": "88 Charles St, Boston, MA",
        "description": "Classic French bistro fare with an award-winning wine list.",
        "latitude": 42.3581,
        "longitude": -71.0709,
    },
    {
        "id": "r8",
        "name": "Seoul Kitchen",
        "cuisine": "Korean",
        "rating": 4.3,
        "user_ratings_total": 234,
        "price_level": 2,
        "atmosphere": "casual, energetic",
        "address": "55 Union Sq, Somerville, MA",
        "description": "Korean BBQ and stews with a modern twist and craft soju cocktails.",
        "latitude": 42.3791,
        "longitude": -71.0949,
    },
    {
        "id": "r9",
        "name": "Pho Pasteur",
        "cuisine": "Vietnamese",
        "rating": 4.4,
        "user_ratings_total": 567,
        "price_level": 1,
        "atmosphere": "casual, bustling",
        "address": "682 Washington St, Boston, MA",
        "description": "Iconic pho spot known for rich broths simmered over 24 hours.",
        "latitude": 42.3511,
        "longitude": -71.0629,
    },
    {
        "id": "r10",
        "name": "The Greek Corner",
        "cuisine": "Greek",
        "rating": 4.5,
        "user_ratings_total": 189,
        "price_level": 2,
        "atmosphere": "warm, Mediterranean",
        "address": "340 Beacon St, Boston, MA",
        "description": "Lamb souvlaki, spanakopita, and fresh tzatziki with imported feta.",
        "latitude": 42.3531,
        "longitude": -71.0779,
    },
    {
        "id": "r11",
        "name": "Burger Lab",
        "cuisine": "American",
        "rating": 4.2,
        "user_ratings_total": 445,
        "price_level": 2,
        "atmosphere": "casual, fun",
        "address": "15 JFK St, Cambridge, MA",
        "description": "Gourmet smash burgers with experimental toppings and craft shakes.",
        "latitude": 42.3721,
        "longitude": -71.1219,
    },
    {
        "id": "r12",
        "name": "Dim Sum Palace",
        "cuisine": "Chinese",
        "rating": 4.6,
        "user_ratings_total": 378,
        "price_level": 2,
        "atmosphere": "bustling, family-friendly",
        "address": "70 Beach St, Boston, MA",
        "description": "Cantonese dim sum with roaming carts and weekend brunch specials.",
        "latitude": 42.3511,
        "longitude": -71.0609,
    },
    {
        "id": "r13",
        "name": "Addis Red Sea",
        "cuisine": "Ethiopian",
        "rating": 4.4,
        "user_ratings_total": 132,
        "price_level": 2,
        "atmosphere": "communal, cozy",
        "address": "544 Tremont St, Boston, MA",
        "description": "Traditional Ethiopian platters on injera with rich berbere spice blends.",
        "latitude": 42.3451,
        "longitude": -71.0719,
    },
    {
        "id": "r14",
        "name": "Casa de Fado",
        "cuisine": "Portuguese",
        "rating": 4.3,
        "user_ratings_total": 98,
        "price_level": 2,
        "atmosphere": "warm, cultural",
        "address": "15 Cambridge St, Cambridge, MA",
        "description": "Portuguese seafood and grilled meats with live fado music on weekends.",
        "latitude": 42.3741,
        "longitude": -71.0889,
    },
    {
        "id": "r15",
        "name": "Taco Loco",
        "cuisine": "Mexican",
        "rating": 4.1,
        "user_ratings_total": 312,
        "price_level": 1,
        "atmosphere": "casual, colorful",
        "address": "99 Brighton Ave, Allston, MA",
        "description": "Late-night tacos al pastor and loaded burritos at budget prices.",
        "latitude": 42.3531,
        "longitude": -71.1349,
    },
    {
        "id": "r16",
        "name": "Ramen House",
        "cuisine": "Japanese",
        "rating": 4.5,
        "user_ratings_total": 289,
        "price_level": 2,
        "atmosphere": "casual, cozy",
        "address": "50 Church St, Cambridge, MA",
        "description": "Rich tonkotsu and miso ramen with 48-hour pork bone broth.",
        "latitude": 42.3731,
        "longitude": -71.1199,
    },
    {
        "id": "r17",
        "name": "Oleana",
        "cuisine": "Mediterranean",
        "rating": 4.7,
        "user_ratings_total": 421,
        "price_level": 3,
        "atmosphere": "intimate, garden",
        "address": "134 Hampshire St, Cambridge, MA",
        "description": "James Beard-nominated Mediterranean with Middle Eastern influences and a garden patio.",
        "latitude": 42.3691,
        "longitude": -71.0989,
    },
    {
        "id": "r18",
        "name": "Maya Sol",
        "cuisine": "Mexican",
        "rating": 4.6,
        "user_ratings_total": 167,
        "price_level": 3,
        "atmosphere": "upscale, vibrant",
        "address": "222 Berkeley St, Boston, MA",
        "description": "Elevated Oaxacan cuisine with handcrafted mezcal cocktails.",
        "latitude": 42.3501,
        "longitude": -71.0759,
    },
    {
        "id": "r19",
        "name": "Chai Pani",
        "cuisine": "Indian",
        "rating": 4.3,
        "user_ratings_total": 245,
        "price_level": 1,
        "atmosphere": "casual, street-food",
        "address": "101 First St, Cambridge, MA",
        "description": "Indian street snacks: chaat, dosas, and masala chai at counter-service speed.",
        "latitude": 42.3631,
        "longitude": -71.0819,
    },
    {
        "id": "r20",
        "name": "Brasserie Jo",
        "cuisine": "French",
        "rating": 4.4,
        "user_ratings_total": 302,
        "price_level": 3,
        "atmosphere": "classic, brasserie",
        "address": "120 Huntington Ave, Boston, MA",
        "description": "Alsatian choucroute, steak frites, and tower of fruits de mer.",
        "latitude": 42.3471,
        "longitude": -71.0779,
    },
    {
        "id": "r21",
        "name": "Bonchon",
        "cuisine": "Korean",
        "rating": 4.2,
        "user_ratings_total": 511,
        "price_level": 2,
        "atmosphere": "casual, modern",
        "address": "57 JFK St, Cambridge, MA",
        "description": "Double-fried Korean fried chicken with soy garlic and spicy glazes.",
        "latitude": 42.3711,
        "longitude": -71.1209,
    },
    {
        "id": "r22",
        "name": "Neptune Oyster",
        "cuisine": "Seafood",
        "rating": 4.8,
        "user_ratings_total": 892,
        "price_level": 4,
        "atmosphere": "intimate, bustling",
        "address": "63 Salem St, Boston, MA",
        "description": "Iconic North End raw bar with the city's best lobster roll.",
        "latitude": 42.3641,
        "longitude": -71.0559,
    },
    {
        "id": "r23",
        "name": "Veggie Galaxy",
        "cuisine": "American",
        "rating": 4.3,
        "user_ratings_total": 198,
        "price_level": 2,
        "atmosphere": "casual, retro",
        "address": "450 Mass Ave, Cambridge, MA",
        "description": "Vegetarian diner with creative plant-based burgers and all-day breakfast.",
        "latitude": 42.3631,
        "longitude": -71.1009,
    },
    {
        "id": "r24",
        "name": "Coppa",
        "cuisine": "Italian",
        "rating": 4.5,
        "user_ratings_total": 356,
        "price_level": 3,
        "atmosphere": "trendy, small-plates",
        "address": "253 Shawmut Ave, Boston, MA",
        "description": "South End enoteca with housemade charcuterie and wood-fired small plates.",
        "latitude": 42.3431,
        "longitude": -71.0689,
    },
    {
        "id": "r25",
        "name": "Taiwan Cafe",
        "cuisine": "Chinese",
        "rating": 4.4,
        "user_ratings_total": 423,
        "price_level": 1,
        "atmosphere": "casual, authentic",
        "address": "34 Oxford St, Boston, MA",
        "description": "Taiwanese comfort food: beef noodle soup, three-cup chicken, and bubble tea.",
        "latitude": 42.3521,
        "longitude": -71.0619,
    },
]

DEMO_USERS = {
    "user-sam": {
        "id": "user-sam",
        "name": "Sam Kwak",
        "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
        "friends": [
            "user-bob",
            "user-carol",
            "user-william",
            "user-maya",
            "user-derek",
            "user-elena",
        ],
        "preferences": (
            "- Loves Japanese and Italian cuisines, especially fresh sushi and handmade pasta\n"
            "- Prefers intimate, upscale atmospheres for dinner but enjoys casual spots for lunch\n"
            "- Usually books dinners in the $45-$70 per person range when the experience feels worth it\n"
            "- Drawn to umami, savory, and delicate flavors\n"
            "- Dislikes overly spicy food"
        ),
    },
    "user-bob": {
        "id": "user-bob",
        "name": "Bob Martinez",
        "avatar": "https://randomuser.me/api/portraits/men/41.jpg",
        "friends": [
            "user-sam",
            "user-carol",
            "user-william",
            "user-maya",
            "user-derek",
            "user-elena",
        ],
        "preferences": (
            "- Big fan of Mexican and Thai food, the spicier the better\n"
            "- Prefers casual, vibrant, and lively restaurants for hanging out with friends\n"
            "- Budget-conscious and happiest in the $12-$25 per person range\n"
            "- Loves bold, spicy, smoky, and tangy flavors\n"
            "- Enjoys street food, food trucks, and late-night eats"
        ),
    },
    "user-carol": {
        "id": "user-carol",
        "name": "Carol Washington",
        "avatar": "https://randomuser.me/api/portraits/women/52.jpg",
        "friends": [
            "user-sam",
            "user-bob",
            "user-william",
            "user-maya",
            "user-derek",
            "user-elena",
        ],
        "preferences": (
            "- Adventurous eater who loves Ethiopian, Indian, and Korean cuisines\n"
            "- Enjoys communal dining experiences and sharing plates with friends\n"
            "- Prefers warm, cozy atmospheres with cultural character\n"
            "- Usually lands in the $28-$48 per person range for shared dinners\n"
            "- Loves complex spice blends, fermented flavors, and aromatic dishes"
        ),
    },
    "user-william": {
        "id": "user-william",
        "name": "William Kang",
        "avatar": "https://randomuser.me/api/portraits/men/68.jpg",
        "friends": [
            "user-sam",
            "user-bob",
            "user-carol",
            "user-maya",
            "user-derek",
            "user-elena",
        ],
        "preferences": (
            "- Leans toward Korean, Japanese, and late-night comfort food, especially ramen and fried chicken\n"
            "- Likes energetic spots that still feel polished enough for a team dinner\n"
            "- Usually chooses restaurants in the $22-$38 per person range\n"
            "- Loves savory, smoky, and peppery flavors with a little heat\n"
            "- Appreciates fast service and easy group ordering"
        ),
    },
    "user-maya": {
        "id": "user-maya",
        "name": "Maya Patel",
        "avatar": "https://randomuser.me/api/portraits/women/64.jpg",
        "friends": [
            "user-sam",
            "user-bob",
            "user-carol",
            "user-william",
            "user-derek",
            "user-elena",
        ],
        "preferences": (
            "- Loves Mediterranean, Indian, and veggie-forward menus with bright herbs and citrus\n"
            "- Prefers airy, design-forward restaurants that still feel relaxed\n"
            "- Typically spends $30-$55 per person for dinner and cocktails\n"
            "- Drawn to fresh, aromatic, and balanced flavors over anything too heavy\n"
            "- Enjoys shareable plates and places that work well for conversation"
        ),
    },
    "user-derek": {
        "id": "user-derek",
        "name": "Derek Chen",
        "avatar": "https://randomuser.me/api/portraits/men/45.jpg",
        "friends": [
            "user-sam",
            "user-bob",
            "user-carol",
            "user-william",
            "user-maya",
            "user-nina",
            "user-elena",
        ],
        "preferences": (
            "- Craves Sichuan heat, hand-pulled noodles, and smoky barbecue joints\n"
            "- Loves loud, communal tables and zero-fuss service\n"
            "- Happy spending $18-$35 for weeknight hangs, splurges for special dumpling spots\n"
            "- Wants bold chili oil, tingly peppercorn, and savory broth-forward dishes\n"
            "- Always down for a post-dinner bubble tea run"
        ),
    },
    "user-elena": {
        "id": "user-elena",
        "name": "Elena Ruiz",
        "avatar": "https://randomuser.me/api/portraits/women/33.jpg",
        "friends": [
            "user-sam",
            "user-bob",
            "user-carol",
            "user-william",
            "user-maya",
            "user-nina",
            "user-derek",
        ],
        "preferences": (
            "- Loves Peruvian ceviche, coastal Mexican seafood, and vegetable-forward tasting menus\n"
            "- Prefers candlelit rooms with good natural wine lists\n"
            "- Typically $35-$60 per person when the occasion feels right\n"
            "- Drawn to bright acidity, charred citrus, and herbaceous cocktails\n"
            "- Avoids overly heavy cream-based sauces"
        ),
    },
    "user-nina": {
        "id": "user-nina",
        "name": "Nina Okonkwo",
        "avatar": "https://randomuser.me/api/portraits/women/89.jpg",
        "friends": ["user-derek", "user-elena"],
        "preferences": (
            "- Excited to explore Spanish tapas, West African flavors, and modern American brunch\n"
            "- Loves bright patios and restaurants with a strong playlist but easy conversation\n"
            "- Usually aims for $25-$40 per person for weeknight hangs\n"
            "- Prefers citrusy, smoky, and herb-forward dishes\n"
            "- Still building out her TableUs taste profile"
        ),
    },
}

REVIEWS = {
    "user-sam": [
        {"id": "rev-a1", "restaurant_name": "Sakura Sushi Bar", "cuisine": "Japanese", "dish": "Omakase Set", "review_text": "Absolutely stunning omakase. Best sushi experience in Boston.", "rating": 5},
        {"id": "rev-a2", "restaurant_name": "Trattoria Milano", "cuisine": "Italian", "dish": "Cacio e Pepe", "review_text": "The cacio e pepe was silky and perfectly peppery. Cozy candlelit vibe made it even better.", "rating": 5},
        {"id": "rev-a3", "restaurant_name": "Coppa", "cuisine": "Italian", "dish": "Burrata & Prosciutto", "review_text": "Small plates were great for sharing. The burrata was incredibly fresh.", "rating": 4},
    ],
    "user-bob": [
        {"id": "rev-b1", "restaurant_name": "El Camino Taqueria", "cuisine": "Mexican", "dish": "Tacos Al Pastor", "review_text": "These tacos are fire. Cheap, fast, and absolutely delicious.", "rating": 5},
        {"id": "rev-b2", "restaurant_name": "Bangkok Street Kitchen", "cuisine": "Thai", "dish": "Pad Kra Pao", "review_text": "Serious heat and authentic street food vibes.", "rating": 5},
        {"id": "rev-b3", "restaurant_name": "Taco Loco", "cuisine": "Mexican", "dish": "Loaded Burrito", "review_text": "Not fancy but exactly what you want at midnight.", "rating": 4},
    ],
    "user-carol": [
        {"id": "rev-c1", "restaurant_name": "Addis Red Sea", "cuisine": "Ethiopian", "dish": "Doro Wot", "review_text": "Layers of spice and such a special shared experience.", "rating": 5},
        {"id": "rev-c2", "restaurant_name": "Spice Route", "cuisine": "Indian", "dish": "Lamb Rogan Josh", "review_text": "Rich, aromatic, and deeply satisfying.", "rating": 5},
        {"id": "rev-c3", "restaurant_name": "Seoul Kitchen", "cuisine": "Korean", "dish": "Kimchi Jjigae", "review_text": "Perfect fermented depth and a generous banchan spread.", "rating": 4},
    ],
    "user-william": [
        {"id": "rev-w1", "restaurant_name": "Ramen House", "cuisine": "Japanese", "dish": "Spicy Miso Ramen", "review_text": "Exactly what I want on a late night.", "rating": 5},
        {"id": "rev-w2", "restaurant_name": "Bonchon", "cuisine": "Korean", "dish": "Soy Garlic Wings", "review_text": "Crisp, sticky, and great when the group wants something fast but fun.", "rating": 4},
    ],
    "user-maya": [
        {"id": "rev-m1", "restaurant_name": "Oleana", "cuisine": "Mediterranean", "dish": "Lamb Shawarma", "review_text": "Beautiful plating and a patio that makes dinner feel special without being stiff.", "rating": 5},
        {"id": "rev-m2", "restaurant_name": "Spice Route", "cuisine": "Indian", "dish": "Vegetable Biryani", "review_text": "Aromatic and layered without feeling heavy.", "rating": 4},
    ],
    "user-nina": [
        {"id": "rev-n1", "restaurant_name": "The Greek Corner", "cuisine": "Greek", "dish": "Grilled Octopus", "review_text": "Perfect char and an addictive lemon-oregano oil.", "rating": 5},
    ],
    "user-derek": [
        {"id": "rev-d1", "restaurant_name": "Dim Sum Palace", "cuisine": "Chinese", "dish": "Soup Dumplings", "review_text": "Juicy, thin skins, and the chili crisp on the table is dangerous.", "rating": 5},
        {"id": "rev-d2", "restaurant_name": "Pho Pasteur", "cuisine": "Vietnamese", "dish": "Spicy Beef Pho", "review_text": "Deep broth, perfect noodles, hits every time after work.", "rating": 4},
    ],
    "user-elena": [
        {"id": "rev-e1", "restaurant_name": "The Pier Seafood Grill", "cuisine": "Seafood", "dish": "Grilled Branzino", "review_text": "Bright herbs, super fresh fish, felt like a mini vacation.", "rating": 5},
        {"id": "rev-e2", "restaurant_name": "Maya Sol", "cuisine": "Mexican", "dish": "Aguachile", "review_text": "Sharp lime, clean heat — exactly the coastal vibe I wanted.", "rating": 5},
    ],
}


def get_all_restaurants():
    return RESTAURANTS


def get_restaurant_by_id(rid: str):
    return next((r for r in RESTAURANTS if r["id"] == rid), None)


def get_all_users():
    return [
        {"id": u["id"], "name": u["name"], "avatar": u["avatar"]}
        for u in DEMO_USERS.values()
    ]


def get_user(user_id: str) -> Optional[dict]:
    return DEMO_USERS.get(user_id)


def get_user_preferences(user_id: str) -> str:
    user = DEMO_USERS.get(user_id)
    return user["preferences"] if user else ""


def set_user_preferences(user_id: str, text: str):
    if user_id in DEMO_USERS:
        DEMO_USERS[user_id]["preferences"] = text


def get_friends(user_id: str) -> list:
    user = DEMO_USERS.get(user_id)
    if not user:
        return []
    return [
        {"id": f["id"], "name": f["name"], "avatar": f["avatar"]}
        for fid in user.get("friends", [])
        if (f := DEMO_USERS.get(fid))
    ]


def add_friend(user_id: str, friend_id: str) -> bool:
    u = DEMO_USERS.get(user_id)
    f = DEMO_USERS.get(friend_id)
    if not u or not f:
        return False
    if friend_id not in u.get("friends", []):
        u.setdefault("friends", []).append(friend_id)
    if user_id not in f.get("friends", []):
        f.setdefault("friends", []).append(user_id)
    return True


def remove_friend(user_id: str, friend_id: str) -> bool:
    u = DEMO_USERS.get(user_id)
    f = DEMO_USERS.get(friend_id)
    if not u or not f:
        return False
    if friend_id in u.get("friends", []):
        u["friends"].remove(friend_id)
    if user_id in f.get("friends", []):
        f["friends"].remove(user_id)
    return True


def add_review(user_id: str, review: dict):
    review["id"] = str(uuid.uuid4())[:8]
    REVIEWS.setdefault(user_id, []).append(review)
    return review


def get_reviews(user_id: str) -> list:
    return REVIEWS.get(user_id, [])
