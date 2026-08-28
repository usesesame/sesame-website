<script lang="ts">
  import { onMount } from 'svelte'
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
  <p class="intro">The whole app is free and open source. The one optional subscription is for hosted sync, and you can run that yourself instead.</p>
</section>
<section class="section pricing-page">
  <div class="pricing-promise">
    <strong>Nothing is for sale yet</strong>
    <p>Registering interest commits you to nothing.</p>
  </div>
  <div class="price-grid">
    {#each productState.plans as plan (plan.id ?? plan.name)}
      <article class="card price-card" class:featured={plan.id === 'free'}>
        <p class="price-name">{plan.name} <span class="price-tag" class:current={plan.id === 'free'}>{plan.id === 'free' ? 'Free forever' : 'Planned'}</span></p>
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
        {:else if syncInterestUrl}
          <a class="button button-soft price-cta" href={syncInterestUrl}>Register Sync interest</a>
        {:else}
          <a class="button button-soft price-cta" href="/roadmap#sync">Read the Sync gate</a>
        {/if}
      </article>
    {/each}
  </div>
  <p class="pricing-note">Nothing is charged today. Final tax, refund, and support terms will appear before checkout opens.</p>

  <div class="faq-block">
    <h2>Before you choose</h2>
    {#each pricingFaqEntries(facts) as entry (entry.question)}
      <details><summary>{entry.question}</summary><p>{entry.answer}{#if entry.syncInterestLink && syncInterestUrl} You can <a href={syncInterestUrl}>register interest in Sync</a> without committing to anything.{/if}</p></details>
    {/each}
  </div>
</section>
