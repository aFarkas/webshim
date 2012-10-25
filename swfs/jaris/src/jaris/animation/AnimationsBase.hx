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

package jaris.animation;

import flash.display.MovieClip;
import flash.display.Stage;
import flash.events.TimerEvent;
import flash.Lib;
import flash.utils.Timer;

/**
 * Jaris main animations
 */
class AnimationsBase
{
	private var _fadeInTimer:Timer;
	private var _fadeOutTimer:Timer;
	
	private var _slideInTimer:Timer;
	private var _slideInOrigX:Float;
	private var _slideInOrigY:Float;
	private var _slideInPosition:String;
	private var _slideInIncrements:Float;
	
	private var _slideOutTimer:Timer;
	private var _slideOutOrigX:Float;
	private var _slideOutOrigY:Float;
	private var _slideOutPosition:String;
	private var _slideOutIncrements:Float;
	
	private var _stage:Stage;
	private var _movieClip:MovieClip;
	
	
	private var _currentObject:Dynamic;
	
	public function new()
	{
		_stage = Lib.current.stage;
		_movieClip = Lib.current;
	}
	
	/**
	 * Moves an object until is shown
	 * @param	event
	 */
	private function slideInTimer(event:TimerEvent):Void
	{
		var last:Bool = false;
		switch(_slideInPosition)
		{
			case "top":
				if (_currentObject.y >= _slideInOrigY) { last = true; }
				_currentObject.y += _slideInIncrements;
				
			case "left":
				if (_currentObject.x >= _slideInOrigX) { last = true; }
				_currentObject.x += _slideInIncrements;
				
			case "bottom":
				if (_currentObject.y <= _slideInOrigY) { last = true; }
				_currentObject.y -= _slideInIncrements;
				
			case "right":
				if (_currentObject.x <= _slideInOrigX) { last = true; }
				_currentObject.x -= _slideInIncrements;
		}
		
		if (last)
		{
			_currentObject.x = _slideInOrigX;
			_currentObject.y = _slideInOrigY;
			_slideInTimer.stop();
		}
	}
	
	/**
	 * Moves an object until is hidden
	 * @param	event
	 */
	private function slideOutTimer(event:TimerEvent):Void
	{
		if (((_currentObject.x + _currentObject.width)  < 0) || (_currentObject.y + _currentObject.height < 0))
		{
			_currentObject.visible = false;
			_currentObject.x = _slideOutOrigX;
			_currentObject.y = _slideOutOrigY;
			
			_slideOutTimer.stop();
		}
		else if (((_currentObject.x)  > _stage.stageWidth) || (_currentObject.y > _stage.stageHeight))
		{
			_currentObject.visible = false;
			_currentObject.x = _slideOutOrigX;
			_currentObject.y = _slideOutOrigY;
			
			_slideOutTimer.stop();
		}
		else
		{
			switch(_slideOutPosition)
			{
				case "top":
					_currentObject.y -= _slideOutIncrements;
					
				case "left":
					_currentObject.x -= _slideOutIncrements;
					
				case "bottom":
					_currentObject.y += _slideOutIncrements;
					
				case "right":
					_currentObject.x += _slideOutIncrements;
			}
		}
	}
	
	/**
	 * Lower object transparency until not visible
	 * @param	event
	 */
	private function fadeOutTimer(event:TimerEvent):Void
	{
		if (_currentObject.alpha > 0)
		{
			_currentObject.alpha -= 1 / 10;
		}
		else
		{
			_currentObject.visible = false;
			_fadeOutTimer.stop();
		}
	}
	
	/**
	 * Highers object transparency until visible
	 * @param	event
	 */
	private function fadeInTimer(event:TimerEvent):Void
	{
		if (_currentObject.alpha < 1)
		{
			_currentObject.alpha += 1 / 10;
		}
		else
		{
			_fadeInTimer.stop();
		}
	}
	
	/**
	 * Effect that moves an object into stage
	 * @param	object the element to move
	 * @param	slidePosition could be top, left bottom or right
	 * @param	speed the time in seconds for duration of the animation
	 */
	public function slideIn(object:Dynamic, slidePosition:String, speed:Float=1000):Void
	{
		if (object.visible)
		{
			object.visible = false;
		}
		
		_slideInOrigX = object.x;
		_slideInOrigY = object.y;
		_slideInPosition = slidePosition;
		
		var increments:Float = 0;
		
		switch(slidePosition)
		{
			case "top":
				object.y = 0 - object.height;
				increments = object.height + _slideInOrigY;
				
			case "left":
				object.x = 0 - object.width;
				increments = object.width + _slideInOrigX;
				
			case "bottom":
				object.y = _stage.stageHeight;
				increments = _stage.stageHeight - _slideInOrigY;
				
			case "right":
				object.x = _stage.stageWidth;
				increments = _stage.stageWidth - _slideInOrigX;
		}
		
		_slideInIncrements = increments / (speed / 100);
		
		_currentObject = object;
		_currentObject.visible = true;
		_currentObject.alpha = 1;
		
		_slideInTimer = new Timer(speed / 100);
		_slideInTimer.addEventListener(TimerEvent.TIMER, slideInTimer);
		_slideInTimer.start();
	}
	
	/**
	 * Effect that moves an object out of stage
	 * @param	object the element to move
	 * @param	slidePosition could be top, left bottom or right
	 * @param	speed the time in seconds for duration of the animation
	 */
	public function slideOut(object:Dynamic, slidePosition:String, speed:Float=1000):Void
	{
		if (!object.visible)
		{
			object.visible = true;
		}
		
		_slideOutOrigX = object.x;
		_slideOutOrigY = object.y;
		_slideOutPosition = slidePosition;
		
		var increments:Float = 0;
		
		switch(slidePosition)
		{
			case "top":
				increments = object.height + _slideOutOrigY;
				
			case "left":
				increments = object.width + _slideOutOrigX;
				
			case "bottom":
				increments = _stage.stageHeight - _slideOutOrigY;
				
			case "right":
				increments = _stage.stageWidth - _slideOutOrigX;
		}
		
		_slideOutIncrements = increments / (speed / 100);
		
		_currentObject = object;
		_currentObject.visible = true;
		_currentObject.alpha = 1;
		
		_slideOutTimer = new Timer(speed / 100);
		_slideOutTimer.addEventListener(TimerEvent.TIMER, slideOutTimer);
		_slideOutTimer.start();
	}
	
	/**
	 * Effect that dissapears an object from stage
	 * @param	object the element to dissapear
	 * @param	speed the time in seconds for the duration of the animation
	 */
	public function fadeOut(object:Dynamic, speed:Float=500):Void
	{
		if (!object.visible)
		{
			object.visible = true;
		}
		
		object.alpha = 1;
		_currentObject = object;
		
		_fadeOutTimer = new Timer(speed / 10);
		_fadeOutTimer.addEventListener(TimerEvent.TIMER, fadeOutTimer);
		_fadeOutTimer.start();
	}
	
	/**
	 * Effect that shows a hidden object an in stage
	 * @param	object the element to show
	 * @param	speed the time in seconds for the duration of the animation
	 */
	public function fadeIn(object:Dynamic, speed:Float=500):Void
	{
		if (object.visible)
		{
			object.visible = false;
		}
		
		object.alpha = 0;
		_currentObject = object;
		_currentObject.visible = true;
		
		_fadeInTimer = new Timer(speed / 10);
		_fadeInTimer.addEventListener(TimerEvent.TIMER, fadeInTimer);
		_fadeInTimer.start();
	}
	
}