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

package jaris.events;

import flash.events.Event;
import flash.media.ID3Info;
import flash.media.Sound;
import flash.net.NetStream;

/**
 * Implements the player events
 */
class PlayerEvents extends Event {
    public static var ASPECT_RATIO = "onAspectRatio";
    public static var MOUSE_SHOW = "onMouseShow";
    public static var MOUSE_HIDE = "onMouseHide";
    public static var FULLSCREEN = "onFullscreen";
    public static var VOLUME_UP = "onVolumeUp";
    public static var VOLUME_DOWN = "onVolumeDown";
    public static var VOLUME_CHANGE = "onVolumeChange"; //Nuevo
    public static var MUTE = "onMute";
    public static var FORWARD = "onForward";
    public static var REWIND = "onRewind";
    public static var PLAY_PAUSE = "onPlayPause";
    public static var SEEK = "onSeek";
    public static var TIME = "onTimeUpdate";
    public static var PROGRESS = "onProgress";
    public static var BUFFERING = "onBuffering";
    public static var NOT_BUFFERING = "onNotBuffering";
    public static var CONNECTION_FAILED = "onConnectionFailed";
    public static var CONNECTION_SUCCESS = "onConnectionSuccess";
    public static var MEDIA_INITIALIZED = "onDataInitialized";
    public static var PLAYBACK_FINISHED = "onPlaybackFinished";
    public static var STOP_CLOSE = "onStopAndClose";
    public static var RESIZE = "onResize";
    public static var USERNOTSUPPORTED = "NotSupportedError";
    public static var USERDENIED = "PermissionDeniedError";
    public static var USERSUCCESS = "onUserSuccess";

    public var name:String;
    public var aspectRatio:Float;
    public var duration:Float;
    public var fullscreen:Bool;
    public var mute:Bool;
    public var volume:Float;
    public var width:Float;
    public var height:Float;
    public var stream:NetStream;
    public var sound:Sound;
    public var time:Float;
    public var id3Info:ID3Info;
    public var seekTime:Float;

    public function new(type:String, bubbles:Bool = false, cancelable:Bool = false) {
        super(type, bubbles, cancelable);

        fullscreen = false;
        mute = false;
        volume = 1.0;
        duration = 0;
        width = 0;
        height = 0;
        time = 0;
        name = type;
        seekTime = 0;
    }
}
