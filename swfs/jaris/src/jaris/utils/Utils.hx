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

package jaris.utils;

import haxe.BaseCode;
import haxe.io.Bytes;
import haxe.io.BytesData;
import StringTools;
using StringTools;

/**
 * Some utility functions
 */
class Utils 
{
	
	
	/**
	 * Converts degrees to radians for easy rotation where applicable
	 * @param	value A radian value to convert
	 * @return conversion of degree to radian
	 */
	public static function degreesToRadians(value:Float):Float
	{
		return (Math.PI / 180) * value;
	}
	
	private static inline var BASE_64_ENCODINGS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	private static inline var BASE_64_PADDING = "=";
	public static function enocdeBytesData( bytesData : BytesData ) : String {
		var bytes = Bytes.ofData(bytesData);
		var encodings = Bytes.ofString(BASE_64_ENCODINGS);
		var base64 = new BaseCode(encodings).encodeBytes(bytes).toString();
		var remainder = base64.length % 4;

		if (remainder > 1) {
			base64 += BASE_64_PADDING;
		}

		if (remainder == 2) {
			base64 += BASE_64_PADDING;
		}
		return base64;
	}


	
	/**
	 * Converts a float value representing seconds to a readale string
	 * @param	time A given time in seconds
	 * @return A string in the format 00:00:00
	 */
	public static function formatTime(time:Float):String
	{
		var seconds:String = "";
		var minutes:String = "";
		var hours:String = "";
		var timeString:String = "";
		
		if (((time / 60) / 60) >= 1)
		{
			if (Math.floor((time / 60)) / 60 < 10)
			{
				hours = "0" + Math.floor((time / 60) / 60) + ":";
			}
			else
			{
				hours = Math.floor((time / 60) / 60) + ":";
			}
			
			if (Math.floor((time / 60) % 60) < 10)
			{
				minutes = "0" + Math.floor((time / 60) % 60) + ":";
			}
			else
			{
				minutes = Math.floor((time / 60) % 60) + ":";
			}
			
			if (Math.floor(time % 60) < 10)
			{
				seconds = "0" + Math.floor(time % 60);
			}
			else
			{
				seconds = Std.string(Math.floor(time % 60));
			}
		}
		else if((time / 60) >= 1)
		{
			hours = "00:";
			
			if (Math.floor(time / 60) < 10)
			{
				minutes = "0" + Math.floor(time / 60) + ":";
			}
			else
			{
				minutes = Math.floor(time / 60) + ":";
			}
			
			if (Math.floor(time % 60) < 10)
			{
				seconds = "0" + Math.floor(time % 60);
			}
			else
			{
				seconds = Std.string(Math.floor(time % 60));
			}
		}
		else
		{
			hours = "00:";
			
			minutes = "00:";
			
			if (Math.floor(time) < 10)
			{
				seconds = "0" + Math.floor(time);
			}
			else
			{
				seconds = Std.string(Math.floor(time));
			}
		}
		
		timeString += hours + minutes + seconds;
		
		return timeString;
	}
	
	/**
	 * Converts a given rtmp source to a valid format for NetStream
	 * @param	source
	 * @return
	 */
	public static function rtmpSourceParser(source:String):String
	{
		if (source.indexOf(".flv") != -1)
		{
			return source.split(".flv").join("");
		}
		else if (source.indexOf(".mp3") != -1)
		{
			return "mp3:" + source.split(".mp3").join("");
		}
		else if (source.indexOf(".mp4") != -1)
		{
			return "mp4:" + source;
		}
		else if (source.indexOf(".f4v") != -1)
		{
			return "mp4:" + source;
		}
		
		return source;
	}
	
	/**
	 * Changes a youtube url to the format youtube.com/v/video_id
	 * @param	source
	 * @return
	 */
	public static function youtubeSourceParse(source:String):String
	{
		var reg = ~/&vq=(small|medium|large|hd720|hd1080|highres)/i;
		source = reg.replace(source, "");
		return source.split("watch?v=").join("v/");
	}
	
	/**
	 * 
	 */
	public static function youtubeQualitySourceParse(source:String):String
	{
		var reg = ~/vq=(small|medium|large|hd720|hd1080|highres)/i;
		return reg.match(source) ? reg.matched(1) : 'default';
	}
}