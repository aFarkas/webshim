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

/**
 * Gives quick access usage to jaris animations
 */
class Animation
{

	/**
	 * Quick access to fade in effect
	 * @param	object the object to animate
	 * @param	seconds the duration of the animation
	 */
	public static function fadeIn(object:Dynamic, seconds:Float):Void
	{
		var animation:AnimationsBase = new AnimationsBase();
		animation.fadeIn(object, seconds);
	}
	
	/**
	 * Quick access to fade out effect
	 * @param	object the object to animate
	 * @param	seconds the duration of the animation
	 */
	public static function fadeOut(object:Dynamic, seconds:Float):Void
	{
		var animation:AnimationsBase = new AnimationsBase();
		animation.fadeOut(object, seconds);
	}
	
	/**
	 * Quick access to slide in effect
	 * @param	object the object to animate
	 * @param	position could be top, left, bottom or right
	 * @param	seconds the duration of the animation
	 */
	public static function slideIn(object:Dynamic, position:String, seconds:Float):Void
	{
		var animation:AnimationsBase = new AnimationsBase();
		animation.slideIn(object, position, seconds);
	}
	
	/**
	 * Quick access to slide out effect
	 * @param	object the object to animate
	 * @param	position could be top, left, bottom or right
	 * @param	seconds the duration of the animation
	 */
	public static function slideOut(object:Dynamic, position:String, seconds:Float):Void
	{
		var animation:AnimationsBase = new AnimationsBase();
		animation.slideOut(object, position, seconds);
	}
	
}