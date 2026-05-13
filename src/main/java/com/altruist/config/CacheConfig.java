package com.altruist.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * Cache configuration using Caffeine — a high-performance in-process cache.
 *
 * Strategy:
 *  - activeDoctors     → 5 min TTL  (balance of freshness vs. DB load for filtered queries)
 *  - subscriptionPlans → 30 min TTL (rarely changes; safe to cache long)
 *  - doctorCities      → 1 hour TTL (static list; changes only when doctors add new cities)
 *  - publishedVlogs    → 10 min TTL (moderate churn; doctors publish/unpublish occasionally)
 *
 * All caches use max 500 entries to prevent unbounded heap growth.
 * CacheEvict annotations in services ensure cache is invalidated on writes.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(Arrays.asList(
                buildCache("activeDoctors",      5,  TimeUnit.MINUTES),
                buildCache("subscriptionPlans",  30, TimeUnit.MINUTES),
                buildCache("doctorCities",       60, TimeUnit.MINUTES),
                buildCache("publishedVlogs",     10, TimeUnit.MINUTES)
        ));
        return manager;
    }

    /**
     * Creates a named Caffeine cache with a write-expiry TTL and max 500 entries.
     * expireAfterWrite evicts entries a fixed duration after they were created or
     * last replaced — ensuring stale data never lives past the TTL even if not accessed.
     */
    private CaffeineCache buildCache(String name, long duration, TimeUnit unit) {
        return new CaffeineCache(name,
                Caffeine.newBuilder()
                        .expireAfterWrite(duration, unit)
                        .maximumSize(500)
                        .recordStats()           // enables /actuator/metrics cache stats
                        .build());
    }
}
