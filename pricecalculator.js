  Vue.component('discount-item', {
    template: '\
      <li>\
        {{ text }}\
      </li>\
    ',
    props: ['text']
  })
  
  new Vue({
    el: '#app',
    data: {
      price: '',
      giftCard: '',
      discountCode: '',
      couponMatch: false,
      isClearanceItem: false,
      isClubMember: false,
      isCreditPayment: false,
    },
    methods:{
      applyCoupon: function() {
        this.couponMatch = this.discountCode == 'ABCABC';
      }
    },
    computed: {
      total: function() {
        var total = this.price;
        var date = new Date();
        var hour = date.getHours();

        if (this.isClearanceItem){
          total *= 0.9;
        }
        
        if (this.isClubMember){
          var discountFactor = 1.0;
          if (date.getMonth() == 6){
            discountFactor -= 0.02;
          }
          if (!this.isClearanceItem){
            discountFactor -=0.05;
          }
          total = total * discountFactor;
        }

        if (total > 500){
          total *= 0.95;
        }

        if (hour >= 15 && hour < 18){
          total *= 0.98;
        }

        if (this.discountCode == 'ABCABC'){
          total *= 0.95;
        }

        if (this.isCreditPayment){
          total *= 1.01;
        }

        return (this.giftCard > total ? 0 : total - this.giftCard).toFixed(2);
      }
    }  
  });