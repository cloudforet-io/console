export const Mixin = {
  methods:{
      /**********************************************************************************
       * Input        => ()
       * Output       => (String): Random HEX digit for color, (ex: '#F0F8FF')
       * Description:    generate random color HEX digits.
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
       * Input        => (l:limit => Integer)
       * Output       => (Array): Array of Random HEX digit for color, (ex: [#F0F8FF,#F0F8FF,#F0F8FF])
       * Description:    generate Array of String which contains random color HEX digits.
       **********************************************************************************/
      getRandomColorArr: function(l) {
        return Array(l).fill().map((_, i) => this.getRandomColor());
      },
      /**********************************************************************************
       * Input        => (v:value: => Any)
       * Output       => (Boolean)
       * Description:    Check whether given value is empty.
       **********************************************************************************/
      isEmpty: function(v) {
        return ( v == "" || v == null || v == undefined || ( v != null && typeof v == "object" && !Object.keys(v).length )) ? true : false;
      },
      /**********************************************************************************
       * Input        => (c:css Object      => type of Object,
       *                  i:use 'Style' YN  => Boolean
       *                  t:use  Trim   YN  => Boolean )
       * Output       => (String): All trimmed css String by condition;
       * Description:    Generate full String of css given Object c by condition of i, t
       **********************************************************************************/
      cssStyler: function(c, i, t) {
        let style = '';
        Object.entries(c).forEach(([key, val]) => {
          if(t){ return style += key.trim() + ':' + val.trim() + (val.indexOf(';') > 0) ? '': ';' ;}
          else{ return style += key + ':' + val + ';';}
          });
        return (i) ? 'style=\"' + style + '\"' : style;
      },
      /**********************************************************************************
       * Input   => (t:text            =>  String)
       * Output  => (Empty):
       * Description:  copy given text to clipboard
       **********************************************************************************/
      selectToCopyToClipboard: function(t) {
        let textArea = document.createElement("textarea");
        textArea.value = t;
        document.body.appendChild(textArea);
        textArea.select();
        let successFailCondition = document.execCommand("Copy");
        textArea.remove();
        console.log('Success', successFailCondition);
      },
    },
    data: function() {
    return {

      }
    },
}

