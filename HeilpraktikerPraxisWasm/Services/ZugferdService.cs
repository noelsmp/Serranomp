using HeilpraktikerPraxisWasm.Models;
using System.Globalization;
using System.Text;

namespace HeilpraktikerPraxisWasm.Services;

// ZUGFeRD 2.x / Factur-X EN 16931
public class ZugferdService
{
    private static string N(decimal d) => d.ToString("F2", CultureInfo.InvariantCulture);

    public string GenerateXml(Rechnung rechnung, PraxisDaten praxis)
    {
        var sb = new StringBuilder();
        var ausstellDatum = rechnung.Ausstellungsdatum.ToString("yyyyMMdd");
        var faelligDatum = rechnung.Faelligkeitsdatum.ToString("yyyyMMdd");
        var patientName = rechnung.Patient?.VollerName ?? "";

        sb.AppendLine("""<?xml version="1.0" encoding="UTF-8"?>""");
        sb.AppendLine("""<rsm:CrossIndustryInvoice""");
        sb.AppendLine("""  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" """);
        sb.AppendLine("""  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" """);
        sb.AppendLine("""  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">""");

        // Context — EN 16931 profile supports line items
        sb.AppendLine("  <rsm:ExchangedDocumentContext>");
        sb.AppendLine("    <ram:GuidelineSpecifiedDocumentContextParameter>");
        sb.AppendLine("      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:en16931</ram:ID>");
        sb.AppendLine("    </ram:GuidelineSpecifiedDocumentContextParameter>");
        sb.AppendLine("  </rsm:ExchangedDocumentContext>");

        // Document
        sb.AppendLine("  <rsm:ExchangedDocument>");
        sb.AppendLine($"    <ram:ID>{Escape(rechnung.Rechnungsnr)}</ram:ID>");
        sb.AppendLine("    <ram:TypeCode>380</ram:TypeCode>");
        sb.AppendLine("    <ram:IssueDateTime>");
        sb.AppendLine($"      <udt:DateTimeString format=\"102\">{ausstellDatum}</udt:DateTimeString>");
        sb.AppendLine("    </ram:IssueDateTime>");
        if (!string.IsNullOrEmpty(rechnung.Notizen))
            sb.AppendLine($"    <ram:IncludedNote><ram:Content>{Escape(rechnung.Notizen)}</ram:Content></ram:IncludedNote>");
        sb.AppendLine("  </rsm:ExchangedDocument>");

        // Transaction
        sb.AppendLine("  <rsm:SupplyChainTradeTransaction>");

        // Line items
        foreach (var (pos, idx) in rechnung.Positionen.Select((p, i) => (p, i + 1)))
        {
            sb.AppendLine($"    <ram:IncludedSupplyChainTradeLineItem>");
            sb.AppendLine($"      <ram:AssociatedDocumentLineDocument><ram:LineID>{idx}</ram:LineID></ram:AssociatedDocumentLineDocument>");
            sb.AppendLine($"      <ram:SpecifiedTradeProduct><ram:Name>{Escape(pos.Leistung)} ({Escape(pos.Ziffer)})</ram:Name></ram:SpecifiedTradeProduct>");
            sb.AppendLine($"      <ram:SpecifiedLineTradeAgreement>");
            sb.AppendLine($"        <ram:NetPriceProductTradePrice><ram:ChargeAmount>{N(pos.Einzelpreis)}</ram:ChargeAmount></ram:NetPriceProductTradePrice>");
            sb.AppendLine($"      </ram:SpecifiedLineTradeAgreement>");
            sb.AppendLine($"      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode=\"C62\">{pos.Anzahl}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>");
            sb.AppendLine($"      <ram:SpecifiedLineTradeSettlement>");
            sb.AppendLine($"        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>E</ram:CategoryCode><ram:RateApplicablePercent>0</ram:RateApplicablePercent></ram:ApplicableTradeTax>");
            sb.AppendLine($"        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>{N(pos.Einzelpreis * pos.Anzahl)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>");
            sb.AppendLine($"      </ram:SpecifiedLineTradeSettlement>");
            sb.AppendLine($"    </ram:IncludedSupplyChainTradeLineItem>");
        }

        // Header Trade Agreement
        sb.AppendLine("    <ram:ApplicableHeaderTradeAgreement>");
        sb.AppendLine("      <ram:SellerTradeParty>");
        sb.AppendLine($"        <ram:Name>{Escape(praxis.Inhaberin.Length > 0 ? praxis.Inhaberin : praxis.Name)}</ram:Name>");
        sb.AppendLine("        <ram:PostalTradeAddress>");
        sb.AppendLine($"          <ram:PostcodeCode>{Escape(praxis.Plz)}</ram:PostcodeCode>");
        sb.AppendLine($"          <ram:LineOne>{Escape(praxis.Strasse)}</ram:LineOne>");
        sb.AppendLine($"          <ram:CityName>{Escape(praxis.Ort)}</ram:CityName>");
        sb.AppendLine("          <ram:CountryID>DE</ram:CountryID>");
        sb.AppendLine("        </ram:PostalTradeAddress>");
        if (!string.IsNullOrEmpty(praxis.Email))
            sb.AppendLine($"        <ram:URIUniversalCommunication><ram:URIID schemeID=\"EM\">{Escape(praxis.Email)}</ram:URIID></ram:URIUniversalCommunication>");
        if (!string.IsNullOrEmpty(praxis.Steuernr))
            sb.AppendLine($"        <ram:SpecifiedTaxRegistration><ram:ID schemeID=\"FC\">{Escape(praxis.Steuernr)}</ram:ID></ram:SpecifiedTaxRegistration>");
        sb.AppendLine("      </ram:SellerTradeParty>");
        sb.AppendLine("      <ram:BuyerTradeParty>");
        sb.AppendLine($"        <ram:Name>{Escape(patientName)}</ram:Name>");
        sb.AppendLine("      </ram:BuyerTradeParty>");
        sb.AppendLine("    </ram:ApplicableHeaderTradeAgreement>");

        sb.AppendLine("    <ram:ApplicableHeaderTradeDelivery/>");

        // Settlement
        sb.AppendLine("    <ram:ApplicableHeaderTradeSettlement>");
        sb.AppendLine($"      <ram:PaymentReference>{Escape(rechnung.Rechnungsnr)}</ram:PaymentReference>");
        sb.AppendLine("      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>");
        if (!string.IsNullOrEmpty(praxis.Iban))
        {
            sb.AppendLine("      <ram:SpecifiedTradeSettlementPaymentMeans>");
            sb.AppendLine("        <ram:TypeCode>58</ram:TypeCode>");
            sb.AppendLine("        <ram:PayeePartyCreditorFinancialAccount>");
            sb.AppendLine($"          <ram:IBANID>{Escape(praxis.Iban.Replace(" ", ""))}</ram:IBANID>");
            sb.AppendLine("        </ram:PayeePartyCreditorFinancialAccount>");
            if (!string.IsNullOrEmpty(praxis.Bic))
                sb.AppendLine($"        <ram:PayeeSpecifiedCreditorFinancialInstitution><ram:BICID>{Escape(praxis.Bic)}</ram:BICID></ram:PayeeSpecifiedCreditorFinancialInstitution>");
            sb.AppendLine("      </ram:SpecifiedTradeSettlementPaymentMeans>");
        }
        sb.AppendLine("      <ram:ApplicableTradeTax>");
        sb.AppendLine($"        <ram:CalculatedAmount>{N(0)}</ram:CalculatedAmount>");
        sb.AppendLine("        <ram:TypeCode>VAT</ram:TypeCode>");
        sb.AppendLine("        <ram:ExemptionReason>Heilbehandlungen im Bereich der Humanmedizin durch Heilpraktiker sind nach § 4 Nr. 14 UStG umsatzsteuerbefreit.</ram:ExemptionReason>");
        sb.AppendLine($"        <ram:BasisAmount>{N(rechnung.Zwischensumme)}</ram:BasisAmount>");
        sb.AppendLine("        <ram:CategoryCode>E</ram:CategoryCode>");
        sb.AppendLine($"        <ram:RateApplicablePercent>{N(0)}</ram:RateApplicablePercent>");
        sb.AppendLine("      </ram:ApplicableTradeTax>");
        sb.AppendLine("      <ram:SpecifiedTradePaymentTerms>");
        sb.AppendLine($"        <ram:DueDateDateTime><udt:DateTimeString format=\"102\">{faelligDatum}</udt:DateTimeString></ram:DueDateDateTime>");
        sb.AppendLine("      </ram:SpecifiedTradePaymentTerms>");
        sb.AppendLine("      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>");
        sb.AppendLine($"        <ram:LineTotalAmount>{N(rechnung.Zwischensumme)}</ram:LineTotalAmount>");
        sb.AppendLine($"        <ram:TaxBasisTotalAmount>{N(rechnung.Zwischensumme)}</ram:TaxBasisTotalAmount>");
        sb.AppendLine($"        <ram:TaxTotalAmount currencyID=\"EUR\">{N(0)}</ram:TaxTotalAmount>");
        sb.AppendLine($"        <ram:GrandTotalAmount>{N(rechnung.Gesamtbetrag)}</ram:GrandTotalAmount>");
        sb.AppendLine($"        <ram:DuePayableAmount>{N(rechnung.Bezahlt ? 0 : rechnung.Gesamtbetrag)}</ram:DuePayableAmount>");
        sb.AppendLine("      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>");
        sb.AppendLine("    </ram:ApplicableHeaderTradeSettlement>");
        sb.AppendLine("  </rsm:SupplyChainTradeTransaction>");
        sb.AppendLine("</rsm:CrossIndustryInvoice>");

        return sb.ToString();
    }

    private static string Escape(string s) => s
        .Replace("&", "&amp;")
        .Replace("<", "&lt;")
        .Replace(">", "&gt;")
        .Replace("\"", "&quot;")
        .Replace("'", "&apos;");
}
