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


package jaris;

import flash.display.MovieClip;
import flash.display.Stage;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.Lib;
import flash.system.Capabilities;

import jaris.display.Menu;
import jaris.display.Poster;
import jaris.player.newcontrols.NewControls;
import jaris.player.JsApi;
import jaris.player.InputType;
import jaris.player.Player;
import jaris.player.StreamType;
import jaris.player.AspectRatio;
import jaris.player.UserSettings;

/**
 * Main jaris player starting point
 */
class Main 
{
	static var stage:Stage;
	static var movieClip:MovieClip;
	
	static function main():Void
	{
		//Initialize stage and main movie clip
		stage = Lib.current.stage;
		movieClip = Lib.current;
		
		stage.scaleMode = StageScaleMode.NO_SCALE;
		stage.align = StageAlign.TOP_LEFT;
		
		//Retrieve user settings
		var userSettings:UserSettings = new UserSettings();
		
		//Reads flash vars
		var parameters:Dynamic<String> = flash.Lib.current.loaderInfo.parameters;
		
		//Initialize and draw player object
		var player:Player = new Player();
		if (Capabilities.playerType == "PlugIn" || Capabilities.playerType == "ActiveX")
		{
			var type:String = parameters.type != "" && parameters.type != null? parameters.type : InputType.VIDEO;
			var streamType:String = parameters.streamtype != "" && parameters.streamtype != null? parameters.streamtype : StreamType.FILE;
			var server:String = parameters.server != "" && parameters.server != null? parameters.server : "";
			var aspectRatio:String = parameters.aspectratio != "" && parameters.aspectratio != null? parameters.aspectratio : "";
			var bufferTime:Float = parameters.buffertime != "" && parameters.buffertime != null? Std.parseFloat(parameters.buffertime) : 0;
			
			if (aspectRatio != "" && !userSettings.isSet("aspectratio"))
			{
				switch(aspectRatio)
				{
					case "1:1":
						player.setAspectRatio(AspectRatio._1_1);
					case "3:2":
						player.setAspectRatio(AspectRatio._3_2);
					case "4:3":
						player.setAspectRatio(AspectRatio._4_3);
					case "5:4":
						player.setAspectRatio(AspectRatio._5_4);
					case "14:9":
						player.setAspectRatio(AspectRatio._14_9);
					case "14:10":
						player.setAspectRatio(AspectRatio._14_10);
					case "16:9":
						player.setAspectRatio(AspectRatio._16_9);
					case "16:10":
						player.setAspectRatio(AspectRatio._16_10);
				}
			}
			else if(userSettings.isSet("aspectratio"))
			{
				player.setAspectRatio(userSettings.getAspectRatio());
			}
			
			player.setType(type);
			player.setStreamType(streamType);
			player.setServer(server);
			player.setVolume(userSettings.getVolume());
			player.setBufferTime(bufferTime);
			
			player.setSource(parameters.source);
			
			player.setHardwareScaling(parameters.hardwarescaling=="true"?true:false);
		}
		else
		{
			//For development purposes
			if(userSettings.isSet("aspectratio"))
			{
				player.setAspectRatio(userSettings.getAspectRatio());
			}
			
			player.setVolume(userSettings.getVolume());
			
			player.load("http://jaris.sourceforge.net/files/jaris-intro.flv", InputType.VIDEO, StreamType.FILE);
			//player.load("http://jaris.sourceforge.net/files/audio.mp3", InputType.AUDIO, StreamType.FILE);
		}
		
		//Draw preview image
		if (parameters.poster != null)
		{
			var poster:String = parameters.poster;
			var posterImage = new Poster(poster);
			posterImage.setPlayer(player);
			movieClip.addChild(posterImage);
		}
		
		//Modify Context Menu
		var menu:Menu = new Menu(player);
		
		
	
		//Draw Controls
		var duration:String = parameters.duration != "" && parameters.duration != null? parameters.duration : "0";
		var controlSize:Int = parameters.controlsize != "" && parameters.controlsize != null? Std.parseInt(parameters.controlsize) : 0;
		
		var controlColors:Array <String> = ["", "", "", "", ""];
		controlColors[0] = parameters.darkcolor != null ? parameters.darkcolor : "";
		controlColors[1] = parameters.brightcolor != null ? parameters.brightcolor : "";
		controlColors[2] = parameters.controlcolor != null ? parameters.controlcolor : "";
		controlColors[3] = parameters.hovercolor != null ? parameters.hovercolor : "";
		controlColors[4] = parameters.seekcolor != null ? parameters.seekcolor : "";
		
		var controls:NewControls = new NewControls(player, parameters.controls);
		controls.setDurationLabel(duration);
		controls.setControlColors(controlColors);
		controls.setControlSize(controlSize);
		movieClip.addChild(controls);
		
		

		var jsAPI:JsApi = new JsApi(player, controls);
		movieClip.addChild(jsAPI);
		player.init();
	}
}