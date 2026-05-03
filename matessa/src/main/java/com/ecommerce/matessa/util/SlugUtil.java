package com.ecommerce.matessa.util;

import com.ecommerce.matessa.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Utility for generating SEO-friendly, URL-safe slugs from product names.
 *
 * <h3>Design decisions</h3>
 * <ul>
 *   <li><b>Unicode normalisation</b> – converts "Café" → "cafe" before stripping,
 *       so accented characters degrade gracefully instead of vanishing silently.</li>
 *   <li><b>Uniqueness guarantee</b> – if the base slug already exists in the DB,
 *       a 4-digit numeric suffix is appended (e.g. "yerba-mate-2847") and re-checked
 *       until a free slot is found.  Avoids the brittle "-1", "-2" counter approach
 *       that leaks product count information.</li>
 *   <li><b>Max length</b> – truncated to 80 characters before uniqueness check,
 *       keeping URLs clean in browser tabs and search snippets.</li>
 * </ul>
 *
 * <h3>Security note</h3>
 * Slugs are publicly visible in the URL. They must NEVER contain the numeric
 * database ID, user data, or any internal identifiers.
 */
@Component
public class SlugUtil {

    private static final int MAX_LENGTH   = 80;
    private static final int SUFFIX_RANGE = 9000; // random suffix: 1000-9999
    private static final int SUFFIX_BASE  = 1000;

    @Autowired
    private ProductRepository productRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Generates a base slug from a raw name string, WITHOUT a uniqueness check.
     * Use this for display / logging only. Call {@link #generateUniqueSlug} for persistence.
     *
     * <p>Example: "Premium Yerba Maté 500g!" → "premium-yerba-mate-500g"</p>
     */
    public static String toBaseSlug(String name) {
        if (name == null || name.isBlank()) return "product";

        // 1. Unicode NFC normalisation → NFD decomposition → strip combining marks (accents)
        String normalized = Normalizer.normalize(name.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // 2. Lowercase
        String lower = normalized.toLowerCase(Locale.ENGLISH);

        // 3. Replace any non-alphanumeric character (except spaces and hyphens) with a space
        String cleaned = lower.replaceAll("[^a-z0-9\\s-]", " ");

        // 4. Collapse whitespace & hyphens → single hyphen
        String hyphenated = cleaned.trim()
                .replaceAll("[\\s-]+", "-");

        // 5. Enforce max length (trim at hyphen boundary to avoid cutting words mid-word)
        if (hyphenated.length() > MAX_LENGTH) {
            hyphenated = hyphenated.substring(0, MAX_LENGTH);
            int lastHyphen = hyphenated.lastIndexOf('-');
            if (lastHyphen > 0) {
                hyphenated = hyphenated.substring(0, lastHyphen);
            }
        }

        // 6. Guard: never return an empty string
        return hyphenated.isEmpty() ? "product" : hyphenated;
    }

    /**
     * Generates a slug that is <b>guaranteed unique</b> in the {@code products} table.
     *
     * <p>Algorithm:</p>
     * <ol>
     *   <li>Compute base slug from the name.</li>
     *   <li>If no collision → return base slug.</li>
     *   <li>If collision → append a random 4-digit suffix and retry (max 20 attempts).</li>
     * </ol>
     *
     * <p>Skips uniqueness check when {@code existingSlug} matches the base slug —
     * this handles <em>updates</em> where the product name hasn't changed.</p>
     *
     * @param name         the product name to slugify
     * @param existingSlug the slug already persisted for this product (null for new products)
     */
    public String generateUniqueSlug(String name, String existingSlug) {
        String base = toBaseSlug(name);

        // No change on update — skip the uniqueness round-trip
        if (base.equals(existingSlug)) {
            return existingSlug;
        }

        // Happy path: base slug is already unique
        if (!productRepository.existsBySlug(base)) {
            return base;
        }

        // Collision path: append random 4-digit suffix until we find a free slot
        for (int attempt = 0; attempt < 20; attempt++) {
            int suffix = SUFFIX_BASE + (int) (Math.random() * SUFFIX_RANGE);
            String candidate = base + "-" + suffix;
            if (!productRepository.existsBySlug(candidate)) {
                return candidate;
            }
        }

        // Extreme fallback (practically unreachable): use nanosecond timestamp
        return base + "-" + (System.nanoTime() % 100_000);
    }
}
