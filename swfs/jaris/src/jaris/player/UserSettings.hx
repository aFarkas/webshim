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

package jaris.player;

import flash.net.SharedObject;


/**
 * To store and retrieve user settings so the player can load them next time it loads.
 * In this way player can remember user selected aspect ratio and volume.
 */
class UserSettings 
{
	private var _settings:SharedObject;
	
	public function new() 
	{
		_settings = SharedObject.getLocal("JarisPlayerUserSettings");
	}
	
	//{Methods
	/**
	 * Deletes all user settings
	 */
	public function deleteSettings():Void
	{		
		_settings.clear();
	}
	
	/**
	 * Checks if a user setting is available
	 * @param	field The name of the setting
	 * @return true if is set false otherwise
	 */
	public function isSet(field:String):Bool
	{
		return Reflect.hasField(_settings.data, field);
	}
	//}
	
	//{Properties Setters
	/**
	 * Stores the volume value
	 * @param	level
	 */
	public function setVolume(level:Float):Void
	{
		_settings.data.volume = level;
		_settings.flush();
	}
	
	/**
	 * Stores the aspect ratio value
	 * @param	aspect
	 */
	public function setAspectRatio(aspectratio:Float):Void
	{
		_settings.data.aspectratio = aspectratio;
		_settings.flush();
	}
	//}
	
	//{Properties Getters
	/**
	 * The last user selected volume value
	 * @return Last user selected volume value or default if not set.
	 */
	public function getVolume():Float
	{
		if (!isSet("volume"))
		{
			return 1.0; //The maximum volume value
		}
		
		return _settings.data.volume;
	}
	
	/**
	 * The last user selected aspect ratio value
	 * @return Last user selected aspect ratio value or default if not set.
	 */
	public function getAspectRatio():Float
	{
		if (!isSet("aspectratio"))
		{
			return 0.0; //Equivalent to original
		}
		
		return _settings.data.aspectratio;
	}
	//}
}