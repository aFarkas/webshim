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

/**
 * Stores the player used aspect ratio constants
 */
class AspectRatio 
{
	public static var _1_1:Float = 1 / 1;	
	public static var _3_2:Float = 3 / 2;	
	public static var _4_3:Float = 4 / 3;
	public static var _5_4:Float = 5 / 4;
	public static var _14_9:Float = 14 / 9;
	public static var _14_10:Float = 14 / 10;
	public static var _16_9:Float = 16 / 9;
	public static var _16_10:Float = 16 / 10;
	
	/**
	 * Calculates the ratio for a given width and height
	 * @param	width
	 * @param	height
	 * @return aspect ratio
	 */
	public static function getAspectRatio(width:Float, height:Float):Float
	{
		return width / height;
	}
}