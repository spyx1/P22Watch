acc={
	interrupt:0,

	on: function() {
		i2c.writeTo(0x18,0x20,0x4f); //CTRL_REG1 20h ODR3 ODR2 ODR1 ODR0 LPen Zen Yen Xen , 50hz, lpen1. zyx
		i2c.writeTo(0x18,0x21,0x00); //highpass filter disabled
		i2c.writeTo(0x18,0x22,0x40); //ia1 interrupt to INT1
		i2c.writeTo(0x18,0x23,0x80); //1000 BDU,MSB at high addr, 1000 HR low
		i2c.writeTo(0x18,0x24,0x00); // latched interrupt off
		i2c.writeTo(0x18,0x25,0x00); //no Interrupt2 , no int polatiry
		i2c.writeTo(0x18,0x32,5); //int1_ths-threshold = 250 milli g's
		i2c.writeTo(0x18,0x33,15); //duration = 1 * 20ms
		i2c.writeTo(0x18,0x30,0xc1); //int1 to xh //rotate = 0

		this.init();
	},

	off: function() {
		if (this.interrupt) {
			clearWatch(this.interrupt);
			this.interrupt = 0;
		}
		i2c.writeTo(0x18,0x20,0x07); //Clear LPen-Enable all axes-Power down
		i2c.writeTo(0x18,0x26);
		i2c.readFrom(0x18,1);// Read REFERENCE-Reset filter block 

		return true;
	},

	init:function() {
		i2c.writeTo(0x18,0x32,20); //int1_ths-threshold = 250 milli g's
		i2c.writeTo(0x18,0x33,1); //duration = 1 * 20ms

		this.interrupt = setWatch(()=> {
			console.log('acc wake');
		}, D8, {
			repeat: true, 
			edge: "rising", 
			debounce: 50
		});

		return true;
	},

	read:function(){
		"ram";
		i2c.writeTo(0x18,0xA8);
		var a =i2c.readFrom(0x18,6);
		let x = this.conv(a[0],a[1]);
		let y = this.conv(a[2],a[3]);
		let z = this.conv(a[4],a[5]);
		let t;
		return {ax:x, ay:y, az:z};
	},
	conv:function(lo,hi){
		"ram";
		let i = (hi<<8)+lo;
		return ((i & 0x7FFF) - (i & 0x8000))/16;
	}
};	