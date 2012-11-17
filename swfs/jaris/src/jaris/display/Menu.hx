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
import flash.events.ContextMenuEvent;
import flash.Lib;
import flash.net.URLRequest;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;
import jaris.player.Player;
import jaris.Version;

/**
 * Modify original context menu
 */
class Menu 
{
	private var _movieClip:MovieClip;
	public static var _player:Player;
	
	private var _contextMenu:ContextMenu;
	private var _jarisVersionMenuItem:ContextMenuItem;
	private var _playMenuItem:ContextMenuItem;
	private var _fullscreenMenuItem:ContextMenuItem;
	private var _muteMenuItem:ContextMenuItem;
	
	public function new(player:Player) 
	{
		_movieClip = Lib.current;
		_player = player;
		
		//Initialize context menu replacement
		_contextMenu = new ContextMenu();
		_contextMenu.hideBuiltInItems();
		
		_contextMenu.addEventListener(ContextMenuEvent.MENU_SELECT, onMenuOpen);
		
		//Initialize each menu item
		_jarisVersionMenuItem = new ContextMenuItem("Jaris Player v" + Version.NUMBER + " webshims edition", true, true, true);
		_jarisVersionMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, onJarisVersion);
		
		_playMenuItem = new ContextMenuItem("Play (SPACE)", true, true, true);
		_playMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, onPlay);
		
		//_fullscreenMenuItem = new ContextMenuItem("Fullscreen View (F)");
		//_fullscreenMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, onFullscreen);
		
		
		_muteMenuItem = new ContextMenuItem("Mute (M)");
		_muteMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, onMute);
		
		
		
		//add all context menu items to context menu object
		_contextMenu.customItems.push(_jarisVersionMenuItem);
		_contextMenu.customItems.push(_playMenuItem);
		//_contextMenu.customItems.push(_fullscreenMenuItem);
		_contextMenu.customItems.push(_muteMenuItem);
		
		
		//override default context menu
		_movieClip.contextMenu = _contextMenu;
	}
	
	/**
	 * Update context menu item captions depending on player status before showing them
	 * @param	event
	 */
	private function onMenuOpen(event:ContextMenuEvent):Void
	{
		if (_player.isPlaying())
		{
			_playMenuItem.caption = "Pause (SPACE)";
		}
		else
		{
			_playMenuItem.caption = "Play (SPACE)";
		}
		
		if (_player.isFullscreen())
		{
			_fullscreenMenuItem.caption = "Normal View";
		}
		else
		{
			_fullscreenMenuItem.caption = "Fullscreen View (F)";
		}
		
		_muteMenuItem.caption = _player.isFullscreen()?"Mute/Unmute":"Mute/Unmute (M)";
		
	}
	
	/**
	 * Open jaris player website
	 * @param	event
	 */
	private function onJarisVersion(event:ContextMenuEvent)
	{
		Lib.getURL(new URLRequest("http://afarkas.github.com/webshim/demos/index.html"), "_blank");
		Lib.getURL(new URLRequest("http://jaris.sourceforge.net"), "_jaris");
	}
	
	/**
	 * Toggles playback
	 * @param	event
	 */
	private function onPlay(event:ContextMenuEvent)
	{
		_player.togglePlay();
	}
	
	/**
	 * Toggles fullscreen
	 * @param	event
	 */
	private function onFullscreen(event:ContextMenuEvent)
	{
		_player.toggleFullscreen();
	}
	
	
	/**
	 * Toggles mute
	 * @param	event
	 */
	private function onMute(event:ContextMenuEvent)
	{
		_player.toggleMute();
	}
}