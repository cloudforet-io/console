export const Mixin = {
  methods:{
      getRandomColor: () => {
        /* Input   => ()
         * Output  => (Random HEX digit for color, ex: #F0F8FF)
         */
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      },
      getRandomColorArr: function(l) {
        /* Input   => (l:limit:Integer)
         * Output  => (Array of random HEX digit for color, ex: [#F0F8FF,#F0F8FF,#F0F8FF])
         */
        return Array(l).fill().map((_, i) => this.getRandomColor());
      },
      isEmpty: function(v) {
        /* Input   => (Any Object)
         * Output  => (Boolean)
         */
        return ( v == "" || v == null || v == undefined || ( v != null && typeof v == "object" && !Object.keys(v).length )) ? true : false;

      },
    },
    data: function() {
    return {

      }
    },
}

