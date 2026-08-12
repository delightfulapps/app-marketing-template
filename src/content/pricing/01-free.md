---
title: "TODO: Free"
price: "$0"
period: "forever"
# `price` above is what a reader sees; `amount` and `billingPeriod` are what
# the structured data uses, because "$4.99 per month" cannot be turned back
# into a number and a currency without guessing at the language. `amount` is a
# number, `billingPeriod` an ISO 8601 duration (P1M, P1Y) omitted for one-off
# and free tiers. A tier missing `amount` is left out of the Offer data
# rather than guessed at — see src/_includes/components/json-ld.webc.
amount: 0
order: 1
featured: false
---

- TODO: what the free tier includes
- TODO: another included item
- TODO: a third included item
