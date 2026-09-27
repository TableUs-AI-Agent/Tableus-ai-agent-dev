package expo.modules.tableusnetworkretrypolicy

import android.app.Application
import android.content.Context
import com.facebook.react.modules.network.OkHttpClientProvider
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package

class NetworkRetryPolicyPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
    return listOf(object : ApplicationLifecycleListener {
      override fun onCreate(application: Application) {
        OkHttpClientProvider.setOkHttpClientFactory {
          OkHttpClientProvider
            .createClientBuilder(application.applicationContext)
            .retryOnConnectionFailure(false)
            .build()
        }
      }
    })
  }
}
