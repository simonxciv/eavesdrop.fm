## ListenBrainz + Plex = ❤

### A simple PHP script to submit listens to [ListenBrainz](https://listenbrainz.org/) via [Plex webhooks](https://support.plex.tv/articles/115002267687-webhooks/)

**Installation:**

1. Download `index.php`.
2. Get your Plex Server's 'uuid' by going to [Settings](https://app.plex.tv/desktop#!/settings) > [Your Server Name] > General. The uuid will be a seemingly random string of characters in the URL. 
3. Take this uuid, and put it in the `$server_uuid` variable at the top of `index.php`.
4. Go to [Your ListenBrainz Profile](https://listenbrainz.org/profile/) and copy the User Token. Put it in the `$lb_token` variable at the top of `index.php`.
5. Put `index.php` on a PHP server somewhere on the internet. Note the URL.
6. Follow the [instructions here](https://support.plex.tv/articles/115002267687-webhooks/) to configure the webhook.

_**Note:** Webhooks are a premium feature and require an active Plex Pass Subscription. If you don't have one yet, get one. Plex is cool, and you should support the important work they do._