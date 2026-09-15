# Expo scene lifecycle adaptation

The scene manifest and AppDelegate migration in this directory are adapted from
`@config-plugins/expo-uiscene-lifecycle`, by 650 Industries, Inc., declared MIT
in its package metadata, at immutable upstream revision:

https://github.com/expo/config-plugins/tree/9d8dccc6fc7c3c529c1d9ab9f2d2df63a7ae61d4/packages/expo-uiscene-lifecycle

Upstream `src/index.ts` SHA-256:
`0df1de4b3ea9cd69d24a1de6aa3f64e98c7b54499ac80221124b17284bb24708`.

The npm package was unpublished when integrated. This adaptation checks the
installed runtime package rather than normalized `sdkVersion`, rejects duplicate
or partial startup transformations, compares manifests without depending on key
order, and enables only TableUs's single-scene configuration. It does not copy
Expo's native runtime, introduce a custom SceneDelegate, or modify Xcode projects.
Expo 57.0.23 owns scene creation and lifecycle/link forwarding.

MIT License

Copyright (c) 650 Industries, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
