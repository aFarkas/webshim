var settings = {
	/** Player versions to embed in the testpage. **/
	players: {
		
		'5.7':'../../src/shims/jwplayer/player.swf'
	},
	/** Available plugins (xml contains all info for flashvars). **/
	plugins: {
		jwwebshims: {
			swf:'plugins/jwwebshims/jwwebshims.swf',
			xml:'plugins/jwwebshims/jwwebshims.xml'
		}
	},
	/** Skins to embed in the testpage. **/
	skins: {
		none:''
	},
	/** All the setup examples with their flashvars. **/
	examples: {
		'empty': {},
		'Default webshims': {
			file:'http://protofunc.com/jme/media/bbb_trailer_mobile.m4v',
			image:'http://protofunc.com/jme/media/bbb_watchtrailer.gif',
			plugins:'jwwebshims',
			height:240,
			width:400
		}
	}
}
