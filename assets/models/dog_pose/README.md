# Dog Pose TFLite Model

Place the quantised model file here:

```
assets/models/dog_pose/best_float16.tflite
```

This file is excluded from git (see .gitignore) because it is a large binary.
Download it from the team's shared storage and place it at the path above before running a dev build.

## Dev Build Requirement

> **This feature requires a native dev build — it will NOT run in Expo Go.**
>
> Every time you add or update a native dependency (react-native-vision-camera,
> react-native-fast-tflite) you must rebuild the native binary:
>
> ```bash
> # iOS
> npx expo run:ios
>
> # or via EAS
> eas build --profile development --platform ios
> ```
>
> You cannot use `expo start` alone after changing native dependencies.
