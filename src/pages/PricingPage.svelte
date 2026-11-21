<script lang="ts">
  import { onMount } from 'svelte'
  import FaqItem from '../FaqItem.svelte'
  import FeatureIcon from '../FeatureIcon.svelte'
  import { buildIn } from '../lib/build-in'
  import type { ProductPlan } from '../lib/product'
  import { planFeatures, pricingFaqEntries, productFacts } from '../lib/product-facts'
  import { loadPlans, loadStatus, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
  const syncInterestUrl = accountUrl('/support?category=billing&intent=sync#new-request')
  const faq = $derived(pricingFaqEntries(facts.syncAvailable))
  const afterSesame = $derived(faq.find((entry) => entry.question.startsWith('What happens if I stop paying')))
  const questions = $derived(faq.filter((entry) => entry !== afterSesame))

  function priceLabel(plan: ProductPlan) {
    const amount = Number(plan.price)
    return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
  }

  function period(plan: ProductPlan) {
    return plan.billing === 'one_time' ? 'once' : plan.billing === 'monthly' ? 'a month' : plan.billing === 'yearly' ? 'a year' : ''
  }

  function annualSaving(plan: ProductPlan) {
    return plan.annualPrice ? Number(plan.price) * 12 - Number(plan.annualPrice) : 0
  }

  onMount(() => {
    void loadStatus()
    void loadPlans()
  })
</script>

<section class="page-hero pricing-hero">
  <h1>The app is free</h1>
  <p class="intro">You pay nothing for Sesame, and nothing in it is held back for a paid version. The only thing that will cost money is Sync on our servers, and you can run Sync on your own server for free.</p>
</section>

<section class="chapter price-plates">
  {#each productState.plans as plan (plan.id ?? plan.name)}
    <article class="price-plate" use:buildIn>
      <p class="price-name">{plan.name} <span class="price-tag" class:current={plan.id === 'free' || plan.available}>{plan.id === 'free' ? 'Free' : plan.available ? 'Open' : 'Not open yet'}</span></p>
      <p class="price-figure">
        <strong>{priceLabel(plan)}</strong>
        {#if period(plan)}<span>{period(plan)}</span>{/if}
        {#if plan.id === 'sync' && plan.annualPrice}<span class="price-or">or €{Number(plan.annualPrice).toFixed(0)} a year{#if annualSaving(plan) > 0}, which saves €{annualSaving(plan).toFixed(0)}{/if}</span>{/if}
      </p>
      <p class="price-desc">{plan.description}</p>
      {#if planFeatures[plan.id]}
        <ul class="price-includes">{#each planFeatures[plan.id] as feature (feature.label)}<li><FeatureIcon name={feature.icon} />{feature.label}</li>{/each}</ul>
      {:else if plan.includes?.length}
        <ul class="price-includes">{#each plan.includes as item (item)}<li>{item}</li>{/each}</ul>
      {/if}
      <div class="price-action">
        {#if plan.id === 'free'}
          {#if facts.publicDownload}
            <a class="button button-xl" href="/releases">Download for Windows and Linux</a>
          {:else}
            <a class="button button-xl button-soft" href="/#product">See what it does</a>
          {/if}
        {:else if plan.available}
          <a class="button button-xl button-soft" href={accountUrl('/account') || '/roadmap#sync'}>Set up Sync</a>
        {:else if syncInterestUrl}
          <a class="button button-xl button-soft" href={syncInterestUrl}>Tell us you want Sync</a>
          <p>You cannot pay for Sync yet, and telling us does not start a subscription.</p>
        {:else}
          <a class="button button-xl button-soft" href="/roadmap#sync">Read about Sync</a>
          <p>You cannot pay for Sync yet.</p>
        {/if}
      </div>
    </article>
  {/each}
</section>

{#if afterSesame}
  <section class="band price-band" use:buildIn>
    <div class="band-inner">
      <h2 class="section-heading">{afterSesame.question}</h2>
      <p class="band-statement">{afterSesame.answer}</p>
    </div>
  </section>
{/if}

<section class="chapter pricing-faq">
  <div class="faq-block" use:buildIn>
    <h2>Questions about pricing</h2>
    {#each questions as entry (entry.question)}
      <FaqItem question={entry.question}>
        <p>{entry.answer} {#if entry.syncInterestLink && syncInterestUrl}You can <a href={syncInterestUrl}>tell us you want it</a>.{/if}</p>
      </FaqItem>
    {/each}
    <p class="pricing-note">We will publish the tax, refund, and support terms before payments open.</p>
  </div>
</section>
