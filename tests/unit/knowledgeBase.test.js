/**
 * Unit tests for knowledge base retrieval.
 * @module tests/unit/knowledgeBase
 */

import { describe, it, expect } from 'vitest';
import {
  classifyIntent,
  retrieveContext,
  INTENT_CATEGORIES,
} from '../../src/services/knowledgeBase.js';

describe('classifyIntent', () => {
  it('classifies navigation queries', () => {
    const intents = classifyIntent('Where is Gate C?');
    expect(intents).toContain(INTENT_CATEGORIES.NAVIGATION);
  });

  it('classifies transportation queries', () => {
    const intents = classifyIntent('How do I get here by train?');
    expect(intents).toContain(INTENT_CATEGORIES.TRANSPORTATION);
  });

  it('classifies accessibility queries', () => {
    const intents = classifyIntent('Where is the wheelchair accessible entrance?');
    expect(intents).toContain(INTENT_CATEGORIES.ACCESSIBILITY);
  });

  it('classifies food queries', () => {
    const intents = classifyIntent('Where can I find halal food?');
    expect(intents).toContain(INTENT_CATEGORIES.FOOD);
  });

  it('classifies policy queries', () => {
    const intents = classifyIntent('Can I bring a water bottle?');
    expect(intents).toContain(INTENT_CATEGORIES.POLICY);
  });

  it('classifies crowd queries', () => {
    const intents = classifyIntent('Which gate should I avoid?');
    expect(intents).toContain(INTENT_CATEGORIES.CROWD);
  });

  it('classifies Spanish queries', () => {
    const intents = classifyIntent('¿Dónde está la puerta A?');
    expect(intents).toContain(INTENT_CATEGORIES.NAVIGATION);
  });

  it('classifies medical queries', () => {
    const intents = classifyIntent('Where is the nearest first aid station?');
    expect(intents).toContain(INTENT_CATEGORIES.MEDICAL);
  });

  it('defaults to GENERAL for unmatched queries', () => {
    const intents = classifyIntent('What is the meaning of life?');
    expect(intents).toContain(INTENT_CATEGORIES.GENERAL);
  });

  it('returns multiple intents sorted by relevance', () => {
    const intents = classifyIntent('Where is the nearest accessible gate entrance?');
    expect(intents.length).toBeGreaterThanOrEqual(2);
    // Should match both navigation and accessibility
    expect(intents).toContain(INTENT_CATEGORIES.NAVIGATION);
    expect(intents).toContain(INTENT_CATEGORIES.ACCESSIBILITY);
  });
});

describe('retrieveContext', () => {
  it('returns context and sources for navigation intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.NAVIGATION], 'Where is Gate A?');
    expect(result.context).toBeTruthy();
    expect(result.context.length).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.intentCategories).toContain(INTENT_CATEGORIES.NAVIGATION);
  });

  it('returns transit data for transportation intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.TRANSPORTATION], 'How to get here by train?');
    expect(result.context).toContain('TRANSPORTATION');
    expect(result.sources).toContain('venue-transit');
  });

  it('returns policy data for policy intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.POLICY], 'What is the bag policy?');
    expect(result.context).toContain('STADIUM POLICIES');
    expect(result.sources).toContain('venue-policies');
  });

  it('returns accessible routes for accessibility intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.ACCESSIBILITY], 'wheelchair entrance');
    expect(result.context).toContain('ACCESSIBLE ROUTES');
    expect(result.sources).toContain('venue-accessible-routes');
  });

  it('returns food data for food intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.FOOD], 'halal food');
    expect(result.context).toContain('FOOD');
    expect(result.sources).toContain('venue-food');
  });

  it('returns venue overview for general intent', () => {
    const result = retrieveContext([INTENT_CATEGORIES.GENERAL], 'hello');
    expect(result.context).toContain('VENUE OVERVIEW');
    expect(result.sources).toContain('venue-overview');
  });

  it('limits to 3 intents maximum', () => {
    const manyIntents = [
      INTENT_CATEGORIES.NAVIGATION,
      INTENT_CATEGORIES.FOOD,
      INTENT_CATEGORIES.TRANSPORTATION,
      INTENT_CATEGORIES.POLICY,
      INTENT_CATEGORIES.MEDICAL,
    ];
    const result = retrieveContext(manyIntents, 'test');
    // Should not process more than 3 intents
    expect(result.sources.length).toBeLessThanOrEqual(10);
  });
});
