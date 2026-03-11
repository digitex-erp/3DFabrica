# Phase 1: Fabric Upload + Seamless Texture Engine - Test Plan

## Test Objectives
Verify that the fabric upload and texture tiling system works realistically with actual fabric photos.

---

## Pre-requisites
1. Supabase project configured with:
   - Storage bucket: `fabrics` (public read, authenticated write)
   - Database table: `fabrics` with RLS enabled
   - Edge Function: `process-fabric` deployed

2. Environment variables configured in `.env.local`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## Test Cases

### TC1: Image Validation
**Goal:** Verify invalid images are rejected

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload 100x100px JPEG | Error: "Image too small. Minimum: 1024x1024px" |
| 2 | Upload 5MB PNG | Error: "File too large. Maximum size: 20MB" |
| 3 | Upload .gif file | Error: "Invalid file type" |

### TC2: Successful Upload
**Goal:** Verify valid images upload correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload 2048x2048 JPG (solid color) | Upload completes, progress shows 0-100% |
| 2 | Check Supabase storage | File exists with correct ID |
| 3 | Check database | Record created with metadata |

### TC3: Seamless Tiling
**Goal:** Verify texture tiles without visible seams

**Test Method:**
1. Upload fabric photo with visible edge pattern
2. Apply to 3D viewer with repeatX=4, repeatY=4
3. Rotate model and inspect edges
4. Look for visible seams at tile boundaries

**Acceptance Criteria:**
- No visible seams at 1m distance
- Smooth transition between tiles
- No obvious "grid" pattern

### TC4: Fabric Presets
**Goal:** Verify different materials render differently

| Fabric Type | Expected Look |
|-------------|---------------|
| Cotton | Matte, slight texture, no shine |
| Silk | Shiny, smooth, reflective |
| Velvet | Deep, rich, slight sheen |
| Leather | Slight shine, smooth |

**Test:** Apply each preset to same fabric image, compare visual results

### TC5: Memory Management
**Goal:** Verify no memory leaks

**Test Method:**
1. Load 10 different fabrics in sequence
2. Check browser task manager
3. Expected: Memory should stabilize, not grow infinitely

### TC6: Bell24h API Integration
**Goal:** Verify external API works

```bash
# Test Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/process-fabric \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/fabric.jpg",
    "fabricType": "velvet",
    "repeatX": 4,
    "repeatY": 4
  }'
```

**Expected:** Returns `{ success: true, fabricId, originalUrl, tiledUrl }`

---

## Real Fabric Test Samples

For realistic testing, use these fabric types:

| Type | Where to Find | What to Look For |
|------|---------------|------------------|
| Cotton | Local market, fabric store | Plain weaves, prints |
| Silk | Ethnic wear stores | Shiny, smooth |
| Velvet | Upholstery shops | Deep color, soft pile |
| Denim | Jeans/ apparel stores | Twill weave |
| Jacquard | Curtain stores | Woven patterns |

**Photo Tips:**
- Use good lighting (natural daylight best)
- Avoid shadows
- Include ruler/contrast for scale reference
- 2048px minimum resolution

---

## Troubleshooting

### Seams Visible in Tiling
- Increase repeat count (try 8x8)
- Use mirror wrapping instead of repeat
- Ensure source image edges match

### Texture Blurry
- Increase anisotropy to 8 or 16
- Use higher resolution source image
- Check mipmap generation

### WebGL Crashes
- Reduce texture size
- Check for memory leaks (use dispose functions)
- Limit concurrent texture loads

---

## Checklist for Production

- [ ] Supabase RLS policies enabled
- [ ] Storage bucket policies set
- [ ] Edge Function deployed
- [ ] All test cases pass
- [ ] Memory leak test passes
- [ ] API integration tested
- [ ] Security: No keys in code
- [ ] Performance: <3s initial load
