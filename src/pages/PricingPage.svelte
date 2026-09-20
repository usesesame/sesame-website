<script lang="ts">
  import { onMount } from 'svelte'
  import FaqItem from '../FaqItem.svelte'
  import { reveal } from '../lib/motion'
  import type { ProductPlan } from '../lib/product'
  import { pricingFaqEntries, productFacts } from '../lib/product-facts'
  import { loadPlans, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
  const syncInterestUrl = accountUrl('/support?category=billing&intent=sync#new-request')

  function priceLabel(plan: ProductPlan) {
    const amount = Number(plan.price)
    return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
  }

  function annualSaving(plan: ProductPlan) {
    return plan.annualPrice ? Number(plan.price) * 12 - Number(plan.annualPrice) : 0
  }

  onMount(() => {
    void loadPlans()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>The app is free.</h1>
  <p class="intro">{facts.syncAvailable ? 'Hosted Sync is an optional subscription.' : 'Hosted Sync is planned as an optional subscription. Sync is not available yet.'}</p>
</section>
<section class="section pricing-page">
  <div class="pricing-promise" use:reveal>
    <strong>Payments are not open</strong>
    <p>Registering interest does not start a subscription.</p>
  </div>
  <div class="price-grid">
    {#each productState.plans as plan (plan.id ?? plan.name)}
      <article class="card price-card" class:featured={plan.id === 'free'} use:reveal>
        <p class="price-name">{plan.name} <span class="price-tag" class:current={plan.id === 'free' || plan.available}>{plan.id === 'free' ? 'Free' : plan.available ? 'Available' : 'Planned'}</span></p>
        {#if plan.id === 'sync' && plan.annualPrice}
          <div class="sync-price-options">
            <p class="price-value">{priceLabel(plan)} <span>monthly</span></p>
            <p class="price-value annual"><strong>€{Number(plan.annualPrice).toFixed(0)}</strong> <span>yearly</span>{#if annualSaving(plan) > 0}<small>Save €{annualSaving(plan).toFixed(0)}</small>{/if}</p>
          </div>
        {:else}
          <p class="price-value">{priceLabel(plan)} {#if plan.billing === 'one_time'}<span>once</span>{:else if plan.billing === 'monthly'}<span>monthly</span>{:else if plan.billing === 'yearly'}<span>yearly</span>{/if}</p>
        {/if}
        <p class="price-desc">{plan.description}</p>
        {#if plan.includes?.length}
          <ul class="price-includes">{#each plan.includes as item (item)}<li>{item}</li>{/each}</ul>
        {/if}
        {#if plan.id === 'free'}
          <a class="button button-soft price-cta" href="/#product">See what it does</a>
        {:else if plan.available}
          <a class="button button-soft price-cta" href={accountUrl('/account') || '/roadmap#sync'}>Set up Sync</a>
        {:else if syncInterestUrl}
          <a class="button button-soft price-cta" href={syncInterestUrl}>Register Sync interest</a>
        {:else}
          <a class="button button-soft price-cta" href="/roadmap#sync">Read the Sync plans</a>
        {/if}
      </article>
    {/each}
  </div>
  <p class="pricing-note" use:reveal>Final tax, refund, and support terms will appear before checkout opens.</p>

  <div class="faq-block" use:reveal>
    <h2>Before you choose</h2>
    {#each pricingFaqEntries(facts.syncAvailable) as entry (entry.question)}
      <FaqItem question="{entry.question}">
        <p>{entry.answer}{#if entry.syncInterestLink && syncInterestUrl} You can <a href={syncInterestUrl}>register interest in Sync</a>.{/if}</p>
      </FaqItem>
    {/each}
  </div>
</section>
