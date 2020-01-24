## Windows Meteor Installer

This is an experimental package that installs Meteor on Windows without requiring Administrator privileges or Chocolatey by being an npm package.

To install Meteor, run:
```
npm i -g @zodern/windows-meteor-installer
```

If Meteor was already installed through this installer, it will do nothing.

Until we have verified this installer works reliably, it will use a different path than the official installer and provide a different command. It will install into `~/AppData/Local/.meteor-z` and be available as `meteorz` instead of `meteor`.

There currently is no uninstall script. To uninstall, run `npm uninstall -g @zodern/windows-meteor-installer` and delete `~/AppData/Local/.meteor-z`.
