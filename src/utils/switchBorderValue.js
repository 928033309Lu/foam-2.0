const swicthValue = {
  data () {
    return {
      Ls: {
        '0': -80,
        '1': -500,
        '2': 10000,
        '3': 1500,
        '4': 800,
        '5': 500,
        '6': 300,
        '7': 200,
        '8': 130,
        '9': 60
      },
      Sl:{
        '-80':0,
        '-500':1,
        '10000':2,
        '1500':3,
        '800':4,
        '500':5,
        '300':6,
        '200':7,
        '130':8,
        '60':9
      }
    }
  },
  methods: {
    changeValue(value,boolean) {
      let val = '';
      if(boolean){
        val = this.Sl[value.toString()];
      }else{
        val = this.Ls[value.toString()];
      }
      return val
    }
  }
}
export {
  swicthValue
};