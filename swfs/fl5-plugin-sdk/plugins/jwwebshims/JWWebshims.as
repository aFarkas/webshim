package {
	import com.longtailvideo.jwplayer.player.IPlayer;
	import com.longtailvideo.jwplayer.player.PlayerState;
	import com.longtailvideo.jwplayer.plugins.IPlugin;
	import com.longtailvideo.jwplayer.plugins.PluginConfig;
	
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	
	import flash.events.Event;
	import flash.utils.describeType;
	
	
	public class JWWebshims extends Sprite implements IPlugin {
		private var _player:IPlayer;
		private var _layer:MovieLayer;
		
		
		/** Let the player know what the name of your plugin is. **/
		public function get id():String { return "jwwebshims"; }

		/** Constructor **/
		public function JWWebshims() {
			
		}
		
		/**
		 * Called by the player after the plugin has been created.
		 *  
		 * @param player A reference to the player's API
		 * @param config The plugin's configuration parameters.
		 */
		public function initPlugin(player:IPlayer, config:PluginConfig):void {
			_player = player;
			
			_layer = new MovieLayer();
			if(!player.config.icons && player.config.controlbar == "none"){
				_layer.width = stage.width;
				_layer.height = stage.height;
			} else {
				_layer.width = 0;
				_layer.height = 0;
			}
			addChild(_layer);
			
			
			
			if (ExternalInterface.available) {
				ExternalInterface.addCallback("hideControls", this.hideControls);
				ExternalInterface.addCallback("showControls", this.showControls);
			}
		}
		
		
		public function hideControls():void {
			_layer.width = stage.width;
			_layer.height = stage.height;
			try {
				_player.controls.controlbar.hide();
				_player.controls.dock.hide();
				_player.controls.display.hide();
			} catch(er){}
		}
		
		public function showControls():void {
			_layer.width = 0;
			_layer.height = 0;
			try {
				_player.controls.controlbar.show();
				_player.controls.dock.show();
				_player.controls.display.show();
			} catch(er){}
		}
		
		
		
		/**
		 * When the player resizes itself, it sets the x/y coordinates of all components and plugins.  
		 * Then it calls resize() on each plugin, which is then expected to lay itself out within 
		 * the requested boundaries.  Plugins whose position and size are not set by flashvar configuration
		 * receive the video display area's dimensions in resize().
		 *  
		 * @param width Width of the plugin's layout area, in pixels 
		 * @param height Height of the plugin's layout area, in pixels
		 */		
		public function resize(wid:Number, hei:Number):void {
			
		}

		
	}
}

import flash.display.Sprite;
import flash.events.Event;
import com.longtailvideo.jwplayer.player.*;


class MovieLayer extends Sprite {
	public function MovieLayer() {
		
		graphics.beginFill(0xFF00FF, 1);
		graphics.drawRect(0, 0, 64, 64);
		graphics.endFill();
		alpha = 0;
	}
}

