import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { or, reads } from '@ember/object/computed';

export default Component.extend({
  stripe: service(),
  accounts: service(),
  flashes: service(),
  account: null,

  stripeElement: null,
  stripeLoading: false,
  newSubscription: null,

  company: reads('newSubscription.billingInfo.company'),
  email: reads('newSubscription.billingInfo.billingEmail'),
  address: reads('newSubscription.billingInfo.address'),
  city: reads('newSubscription.billingInfo.city'),
  country: reads('newSubscription.billingInfo.country'),

  fullName: computed(
    'newSubscription.billingInfo.firstName',
    'newSubscription.billingInfo.lastName',
    function () {
      return `${this.newSubscription.billingInfo.firstName} ${this.newSubscription.billingInfo.lastName}`;
    }
  ),

  isLoading: or('createSubscription.isRunning', 'accounts.fetchSubscriptions.isRunning'),

  createSubscription: task(function* () {
    const { stripeElement, account, newSubscription, selectedPlan } = this;
    const { token: { id, card }, error } = yield this.stripe.createStripeToken.perform(stripeElement);
    if (!error) {
      newSubscription.creditCardInfo.setProperties({ token: id, lastDigits: card.last4 });
      const organizationId = account.type === 'organization' ? Number(account.id) : null;
      newSubscription.setProperties({ organizationId, plan: selectedPlan });

      const { clientSecret } = yield newSubscription.save();
      if (clientSecret) {
        yield this.stripe.handleStripePayment.linked().perform(clientSecret);
      }
      yield this.accounts.fetchSubscriptions.perform();
    }
  }).drop(),

  reset() {
    this.newSubscription.billingInfo.setProperties({
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      vatId: '',
      billingEmail: '',
    });
  },

  options: {
    hidePostalCode: true,
    style: {
      base: {
        fontStyle: 'Source Sans Pro',
        fontSize: '15px',
        color: '#666',
        '::placeholder': {
          color: '#666'
        },
      },
      invalid: {
        color: 'red',
        iconColor: 'red'
      }
    }
  },

  actions: {
    complete(stripeElement) {
      this.set('stripeElement', stripeElement);
    },
  }
});