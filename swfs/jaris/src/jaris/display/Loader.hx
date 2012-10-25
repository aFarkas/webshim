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

import flash.display.MovieClip;
import flash.display.Sprite;
import flash.display.Stage;
import flash.events.Event;
import flash.Lib;

/**
 * Draws a loading bar
 */
class Loader extends Sprite 
{
	private var _stage:Stage;
	private var _movieClip:MovieClip;
	private var _background:Sprite;
	private var _loaderTrack:Sprite;
	private var _loaderThumb:Sprite;
	private var _visible:Bool;
	private var _brightColor:UInt;
	private var _controlColor:UInt;
	private var _forward:Bool;

	public function new() 
	{
		super();
		
		_stage = Lib.current.stage;
		_movieClip = Lib.current;
		
		_background = new Sprite();
		addChild(_background);
		
		_loaderTrack = new Sprite();
		addChild(_loaderTrack);
		
		_loaderThumb = new Sprite();
		addChild(_loaderThumb);
		
		_brightColor = 0x4c4c4c;
		_controlColor = 0xFFFFFF;
		
		_forward = true;
		_visible = true;
		
		addEventListener(Event.ENTER_FRAME, onEnterFrame);
		_stage.addEventListener(Event.RESIZE, onResize);
		
		drawLoader();
	}
	
	/**
	 * Animation of a thumb moving on the track
	 * @param	event
	 */
	private function onEnterFrame(event:Event):Void
	{
		if (_visible)
		{
			if (_forward)
			{
				if ((_loaderThumb.x + _loaderThumb.width) >= (_loaderTrack.x + _loaderTrack.width))
				{
					_forward = false;
				}
				else
				{
					_loaderThumb.x += 10;
				}
			}
			else
			{
				if (_loaderThumb.x  <= _loaderTrack.x)
				{
					_forward = true;
				}
				else
				{
					_loaderThumb.x -= 10;
				}
			}
		}
	}
	
	/**
	 * Redraws the loader to match new stage size
	 * @param	event
	 */
	private function onResize(event:Event):Void
	{
		drawLoader();
	}
	
	/**
	 * Draw loader graphics
	 */
	private function drawLoader():Void
	{
		//Clear graphics
		_background.graphics.clear();
		_loaderTrack.graphics.clear();
		_loaderThumb.graphics.clear();
		
		//Draw background
		var backgroundWidth:Float = (65 / 100) * _stage.stageWidth;
		var backgroundHeight:Float = 30;
		_background.x = (_stage.stageWidth / 2) - (backgroundWidth / 2);
		_background.y = (_stage.stageHeight / 2) - (backgroundHeight / 2);
		_background.graphics.lineStyle();
		_background.graphics.beginFill(_brightColor, 0.5);
		_background.graphics.drawRoundRect(0, 0, backgroundWidth, backgroundHeight, 6, 6);
		_background.graphics.endFill();
		
		//Draw track
		var trackWidth:Float = (50 / 100) * _stage.stageWidth;
		var trackHeight:Float = 15;
		_loaderTrack.x = (_stage.stageWidth / 2) - (trackWidth / 2);
		_loaderTrack.y = (_stage.stageHeight / 2) - (trackHeight / 2);
		_loaderTrack.graphics.lineStyle(2, _controlColor);
		_loaderTrack.graphics.drawRect(0, 0, trackWidth, trackHeight);
		
		//Draw thumb
		_loaderThumb.x = _loaderTrack.x;
		_loaderThumb.y = _loaderTrack.y;
		_loaderThumb.graphics.lineStyle();
		_loaderThumb.graphics.beginFill(_controlColor, 1);
		_loaderThumb.graphics.drawRect(0, 0, trackHeight, trackHeight);
	}
	
	/**
	 * Stops drawing the loader
	 */
	public function hide():Void
	{
		this.visible = false;
		_visible = false;
	}
	
	/**
	 * Starts drawing the loader
	 */
	public function show():Void
	{
		this.visible = true;
		_visible = true;
	}
	
	/**
	 * Set loader colors
	 * @param	colors
	 */
	public function setColors(colors:Array<String>):Void
	{
		_brightColor = colors[0].length > 0? Std.parseInt("0x" + colors[0]) : 0x4c4c4c;
		_controlColor = colors[1].length > 0? Std.parseInt("0x" + colors[1]) : 0xFFFFFF;
		
		drawLoader();
	}
}