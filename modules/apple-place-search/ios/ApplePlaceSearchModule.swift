import Contacts
import ExpoModulesCore
import MapKit

public class ApplePlaceSearchModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ApplePlaceSearch")

    AsyncFunction("search") { (query: String, promise: Promise) in
      DispatchQueue.main.async {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        if #available(iOS 13.0, *) {
          request.resultTypes = [.pointOfInterest, .address]
        }

        let search = MKLocalSearch(request: request)
        search.start { response, error in
          if let error = error as NSError? {
            // MKError.placemarkNotFound and similar "no results" errors should not reject — return [].
            if error.domain == MKErrorDomain {
              promise.resolve([] as [[String: String]])
              return
            }
            promise.reject("E_PLACE_SEARCH", error.localizedDescription)
            return
          }
          let items = response?.mapItems ?? []
          let results: [[String: String]] = items.map { item in
            let placemark = item.placemark
            let address: String
            if let postalAddress = placemark.postalAddress {
              address = CNPostalAddressFormatter
                .string(from: postalAddress, style: .mailingAddress)
                .replacingOccurrences(of: "\n", with: ", ")
            } else {
              let parts: [String?] = [
                [placemark.subThoroughfare, placemark.thoroughfare]
                  .compactMap { $0 }
                  .joined(separator: " "),
                placemark.locality,
                placemark.administrativeArea,
                placemark.postalCode,
                placemark.country,
              ]
              address = parts.compactMap { $0 }
                .filter { !$0.isEmpty }
                .joined(separator: ", ")
            }
            return [
              "name": item.name ?? "",
              "address": address,
            ]
          }
          promise.resolve(results)
        }
      }
    }
  }
}
