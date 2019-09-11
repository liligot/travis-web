import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { or, reads } from '@ember/object/computed';
import config from 'travis/config/environment';

export default Component.extend({
  stripe: service(),
  accounts: service(),
  flashes: service(),

  account: null,
  stripeElement: null,
  stripeLoading: false,
  newSubscription: null,
  options: config.stripeOptions,

  firstName: reads('newSubscription.billingInfo.firstName'),
  lastName: reads('newSubscription.billingInfo.lastName'),
  company: reads('newSubscription.billingInfo.company'),
  email: reads('newSubscription.billingInfo.billingEmail'),
  address: reads('newSubscription.billingInfo.address'),
  city: reads('newSubscription.billingInfo.city'),
  coupon: reads('newSubscription.coupon'),
  country: reads('newSubscription.billingInfo.country'),
  isLoading: or('createSubscription.isRunning', 'accounts.fetchSubscriptions.isRunning'),

  createSubscription: task(function* () {
    const { stripeElement, account, newSubscription, selectedPlan } = this;
    const {
      token: { id, card },
      error
    } = yield this.stripe.createStripeToken.perform(stripeElement);
    try {
      if (!error) {
        const organizationId = account.type === 'organization' ? Number(account.id) : null;
        newSubscription.creditCardInfo.setProperties({
          token: id,
          lastDigits: card.last4
        });
        newSubscription.setProperties({ organizationId, plan: selectedPlan });
        const { clientSecret } = yield newSubscription.save();
        yield this.stripe.handleStripePayment.perform(clientSecret);
        yield this.accounts.fetchSubscriptions.perform();
      }
    } catch (error) {
      // assert if status == 422 unprocessable entity -- display error message (eg: invalid vat)
      this.flashes.error('An error occurred when creating your subscription. Please try again.');
    }
  }).drop(),

  actions: {
    complete(stripeElement) {
      this.set('stripeElement', stripeElement);
    },
  }
});
