function FindProxyForURL(url, host)
{
   if (shExpMatch(host, "*.youtube.com")
      || shExpMatch(host, "*.ytimg.com")
      || shExpMatch(host, "*.google*")
      || shExpMatch(host, "*.ggpht.com*")
      || shExpMatch(host, "*.gstatic.com*")
   ) { 
     return "PROXY 192.168.0.108:20080";
   }
  
   return "DIRECT";   
}
