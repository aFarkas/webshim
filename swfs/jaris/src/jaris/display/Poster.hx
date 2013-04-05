/**    
 * @author Jefferson González
 * @copyright 2010 Jefferson González
 *
 * @license 
 * This file is part of Jaris FLV Player.
 *
 * Jaris FLV Player is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License or GNU LESSER GENERAL 
 * PUBLIC LICENSE as published by the Free Software Foundation, either version 
 * 3 of the License, or (at your option) any later version.
 *
 * Jaris FLV Player is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License and 
 * GNU LESSER GENERAL PUBLIC LICENSE along with Jaris FLV Player.  If not, 
 * see <http://www.gnu.org/licenses/>.
 */

package jaris.display;

import flash.display.DisplayObject;
import flash.display.Loader;
import flash.display.MovieClip;
import flash.display.Sprite;
import flash.display.Stage;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.Lib;
import flash.net.URLRequest;
import jaris.events.PlayerEvents;
import jaris.player.InputType;
import jaris.player.Player;

/**
 * To display an png, jpg or gif as preview of video content
 */
class Poster extends Sprite
{

	private var _stage:Stage;
	private var _movieClip:MovieClip;
	private var _loader:Loader;
	private var _source:String;
	private var _width:Float;
	private var _height:Float;
	private var _loading:Bool;
	private var _loaderStatus:jaris.display.Loader;
	private var _player:Player;
	private var _showLoader:Bool;
	
	public function new(source:String, showLoader:Bool)
	{
		super();
		
		_stage = Lib.current.stage;
		_movieClip = Lib.current;
		_loader = new Loader();
		_source = source;
		_loading = true;
		_showLoader = showLoader;
		
		//Reads flash vars
		var parameters:Dynamic<String> = flash.Lib.current.loaderInfo.parameters;
		
		//Draw Loader status
		var loaderColors:Array <String> = ["", "", "", ""];
		loaderColors[0] = parameters.brightcolor != null ? parameters.brightcolor : "";
		loaderColors[1] = parameters.controlcolor != null ? parameters.controlcolor : "";
		
		_loaderStatus = new jaris.display.Loader();
		
		if ( _showLoader ) {
			_loaderStatus.show();
			_loaderStatus.setColors(loaderColors);
			addChild(_loaderStatus);
		}
		
		_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoaderComplete);
		_loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onNotLoaded);
        _loader.load(new URLRequest(source));
	}
	
	/**
	 * Triggers when the poster image could not be loaded
	 * @param	event
	 */
	private function onNotLoaded(event:IOErrorEvent):Void
	{
		if ( _showLoader ) {
			_loaderStatus.hide();
			removeChild(_loaderStatus);
		}
	}
	
	/**
	 * Triggers when the poster image finalized loading
	 * @param	event
	 */
	private function onLoaderComplete(event:Event):Void
	{
		if ( _showLoader ) {
			_loaderStatus.hide();
			removeChild(_loaderStatus);
		}
		
		addChild(_loader);
		
		_width = this.width;
		_height = this.height;
		_loading = false;
		
		_stage.addEventListener(Event.RESIZE, onStageResize);
		
		resizeImage();
	}
	
	/**
	 * Triggers when the stage is resized to resize the poster image
	 * @param	event
	 */
	private function onStageResize(event:Event):Void
	{
		resizeImage();
	}
	
	private function onPlayerMediaInitialized(event:PlayerEvents)
	{
		if (_player.getType() == InputType.VIDEO)
		{
			if ( !_player.getLoadType() ) {
				this.visible = false;
			}
		}
	}
	
	private function onPlayerPlay(event:PlayerEvents)
	{
		if (_player.getType() == InputType.VIDEO)
		{
			this.visible = false;
		}
	}
	
	private function onPlayBackFinished(event:PlayerEvents)
	{
		this.visible = true;
	}
	
	/**
	 * Resizes the poster image to take all the stage
	 */
	private function resizeImage():Void
	{
		this.height = _stage.stageHeight;
		this.width = ((_width / _height) * this.height);
		
		this.x = (_stage.stageWidth / 2) - (this.width / 2);
	}
	
	/**
	 * To check if the poster image stills loading
	 * @return true if stills loading false if loaded
	 */
	public function isLoading():Bool
	{
		return _loading;
	}
	
	public function setPlayer(player:Player):Void
	{
		_player = player;
		_player.addEventListener(PlayerEvents.MEDIA_INITIALIZED, onPlayerMediaInitialized);
		//_player.addEventListener(PlayerEvents.PLAYBACK_FINISHED, onPlayBackFinished);
		_player.addEventListener(PlayerEvents.PLAY_PAUSE, onPlayerPlay);
	}
	
}