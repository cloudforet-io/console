export const Mixin = {
  methods:{
      /**********************************************************************************
       * Input   => ()
       * Output  => (String): Random HEX digit for color, (ex: '#F0F8FF')
       **********************************************************************************/
      getRandomColor: () => {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      },
      /**********************************************************************************
       * Input   => (l:limit => Integer)
       * Output  => (Array): Array of Random HEX digit for color, (ex: [#F0F8FF,#F0F8FF,#F0F8FF])
       **********************************************************************************/
      getRandomColorArr: function(l) {
        return Array(l).fill().map((_, i) => this.getRandomColor());
      },
      /**********************************************************************************
       * Input   => (v:value: => Any)
       * Output  => (Boolean)
       **********************************************************************************/
      isEmpty: function(v) {
        return ( v == "" || v == null || v == undefined || ( v != null && typeof v == "object" && !Object.keys(v).length )) ? true : false;
      },
      /**********************************************************************************
       * Input   => (c:css Object      => type of Object,
       *             i:use 'Style' YN  => Boolean
       *             t:use  Trim   YN  => Boolean )
       * Output  => (String): All trimmed css String;
       **********************************************************************************/
      cssStyler: function(c, i, t) {
      let style = '';
      Object.entries(c).forEach(([key, val]) => {
        if(t){ return style += key.trim() + ':' + val.trim() + (val.indexOf(';') > 0) ? '': ';' ;}
        else{ return style += key + ':' + val + ';';}
        });
      return (i) ? 'style=\"' + style + '\"' : style;
      },
    },
    data: function() {
    return {

      }
    },
}

